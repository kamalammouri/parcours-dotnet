window.COURSE = window.COURSE || [];

/* ============================================================
   2.8 Boucles for, while et do while
   ============================================================ */
window.COURSE.push({
  key: "l-loops",
  title: "Boucles for, while et do while",
  summary: "Tu sauras répéter des instructions avec for, while et do while, sans tomber dans une boucle infinie.",
  objectives: [
    "Lire et écrire une boucle for (initialisation ; condition ; pas)",
    "Choisir entre while et do while",
    "Repérer et éviter une boucle infinie",
    "Imbriquer deux boucles pour construire un tableau de valeurs"
  ],
  analogy: `<p>Pense à un coach sportif qui te dit : « Fais 10 pompes. » Tu commences à 1, tu comptes à chaque pompe, et tu t'arrêtes quand tu arrives à 10. C'est exactement une boucle <code>for</code> : un compteur, une limite, un pas.</p>
<p>Maintenant le coach dit : « Cours tant que tu n'es pas fatigué. » Tu ne sais pas combien de tours tu feras : tu vérifies ton état avant chaque tour. C'est la boucle <code>while</code>.</p>`,
  lesson: `<h3>Pourquoi répéter ?</h3>
<p>Afficher les nombres de 1 à 5, c'est cinq lignes de <code>Console.WriteLine</code>. De 1 à 1000, ce serait absurde. Une <strong>boucle</strong> est un bloc de code que le programme exécute plusieurs fois, tant qu'une condition est vraie. Chaque passage dans la boucle s'appelle un <strong>tour</strong> (ou une itération).</p>
<p>Bonne nouvelle : la syntaxe de <code>for</code>, <code>while</code> et <code>do while</code> est presque identique à celle de TypeScript. La seule différence visible : en C# on déclare le compteur avec son type, <code>int i</code>, au lieu de <code>let i</code>.</p>

<h3>La boucle for décortiquée</h3>
<p>On utilise <code>for</code> quand on sait combien de tours on veut faire. Sa parenthèse contient trois parties séparées par des points-virgules :</p>
<pre class="diagram">for (int i = 1 ; i &lt;= 3 ; i++)
     ---------   ------   ---
         |          |      |
  initialisation    |     pas : après chaque tour
  (une seule fois)  |
          condition : vérifiée avant chaque tour</pre>
<div class="flow"><span>Initialisation</span><span>Condition vraie ?</span><span>Corps de la boucle</span><span>Pas (i++)</span></div>
<p>Après le pas, on revient à la condition. Dès qu'elle est fausse, on sort de la boucle. Voici l'exécution tour par tour de <code>for (int i = 1; i &lt;= 3; i++) Console.WriteLine(i);</code> :</p>
<table>
<tr><th>Tour</th><th>Valeur de i</th><th>i &lt;= 3 ?</th><th>Action</th></tr>
<tr><td>1</td><td>1</td><td>vrai</td><td>affiche 1, puis i devient 2</td></tr>
<tr><td>2</td><td>2</td><td>vrai</td><td>affiche 2, puis i devient 3</td></tr>
<tr><td>3</td><td>3</td><td>vrai</td><td>affiche 3, puis i devient 4</td></tr>
<tr><td>-</td><td>4</td><td>faux</td><td>sortie de la boucle</td></tr>
</table>
<p>Le compteur <code>i</code> n'existe que dans la boucle : après l'accolade fermante, il a disparu.</p>

<h3>while : la condition d'abord</h3>
<p><code>while</code> (« tant que ») vérifie sa condition <strong>avant</strong> chaque tour. Si elle est fausse dès le départ, le corps n'est jamais exécuté. On l'utilise quand on ne connaît pas le nombre de tours à l'avance : « tant que l'argent est inférieur à 100, double-le ».</p>

<h3>do while : au moins une fois</h3>
<p><code>do { ... } while (condition);</code> exécute le corps <strong>puis</strong> vérifie la condition. Le corps tourne donc au minimum une fois. C'est parfait pour un menu : on l'affiche, l'utilisateur choisit, et on recommence tant qu'il n'a pas choisi « Quitter ». Attention au point-virgule après le <code>while</code> final, il est obligatoire.</p>
<div class="compare"><div><h4>while</h4><p>Vérifie, puis exécute. Peut faire zéro tour.</p></div><div><h4>do while</h4><p>Exécute, puis vérifie. Fait toujours au moins un tour.</p></div></div>

<h3>Le piège : la boucle infinie</h3>
<p>Une boucle infinie est une boucle dont la condition ne devient jamais fausse. Le programme tourne sans fin et il faut l'arrêter avec <code>Ctrl+C</code>. Cause classique : oublier de modifier la variable testée.</p>
<div class="tip">Dans un <code>while</code>, vérifie toujours qu'une ligne du corps fait avancer la condition vers « faux » (un compteur qui augmente, une saisie qui change). Sans elle, ta boucle ne s'arrêtera jamais.</div>

<h3>Boucles imbriquées</h3>
<p>On peut mettre une boucle dans une autre. Pour chaque tour de la boucle extérieure, la boucle intérieure fait <strong>tous</strong> ses tours. C'est comme une horloge : l'aiguille des minutes fait un tour complet pendant que celle des heures avance d'un cran. Deux boucles de 3 tours donnent donc 3 × 3 = 9 passages au total. On s'en sert pour les tables de multiplication, les grilles ou les tableaux à deux dimensions.</p>
<div class="note">Donne des noms parlants aux compteurs imbriqués (<code>row</code> et <code>col</code>, <code>table</code> et <code>i</code>) plutôt que <code>i</code> et <code>j</code> : c'est ce qui évite d'inverser les deux dans le corps, le bug le plus fréquent avec les boucles imbriquées.</div>`,
  examples: [
    {
      title: "Compter avec for",
      code: `for (int i = 1; i <= 5; i++)
{
    Console.WriteLine($"Tour {i}");
}
Console.WriteLine("Fin de la boucle");`,
      output: `Tour 1
Tour 2
Tour 3
Tour 4
Tour 5
Fin de la boucle`,
      steps: [
        "<code>int i = 1</code> : on crée le compteur, une seule fois, avant le premier tour.",
        "<code>i &lt;= 5</code> : avant chaque tour, on vérifie que le compteur n'a pas dépassé 5.",
        "<code>Console.WriteLine($\"Tour {i}\")</code> : le corps, exécuté à chaque tour avec la valeur actuelle de <code>i</code>.",
        "<code>i++</code> : après chaque tour, le compteur augmente de 1.",
        "<code>Console.WriteLine(\"Fin de la boucle\")</code> : quand <code>i</code> vaut 6, la condition est fausse et le programme continue après la boucle."
      ],
      explain: "Cinq tours, puis le programme reprend son cours normal."
    },
    {
      title: "while et do while côte à côte",
      code: `int amount = 10;
int steps = 0;
while (amount < 100)
{
    amount *= 2;
    steps++;
}
Console.WriteLine($"{steps} doublements pour atteindre {amount}");

int n = 50;
do
{
    Console.WriteLine($"do while : un tour malgré n = {n}");
} while (n < 5);`,
      output: `4 doublements pour atteindre 160
do while : un tour malgré n = 50`,
      steps: [
        "<code>while (amount &lt; 100)</code> : on ne sait pas combien de doublements il faudra, alors on teste la condition avant chaque tour.",
        "<code>amount *= 2;</code> : cette ligne fait avancer la condition. Sans elle, la boucle serait infinie.",
        "<code>steps++;</code> : on compte les tours. 10, 20, 40, 80, 160 : il a fallu 4 doublements.",
        "<code>do { ... }</code> : le corps s'exécute d'abord, sans aucune vérification.",
        "<code>while (n &lt; 5);</code> : la condition est fausse (50 n'est pas inférieur à 5), mais le tour a déjà eu lieu. On s'arrête là."
      ],
      explain: "while peut faire zéro tour, do while en fait toujours au moins un."
    },
    {
      title: "Boucles imbriquées : tables de multiplication",
      code: `for (int table = 2; table <= 3; table++)
{
    Console.WriteLine($"Table de {table} :");
    for (int i = 1; i <= 3; i++)
    {
        Console.WriteLine($"  {table} x {i} = {table * i}");
    }
}`,
      output: `Table de 2 :
  2 x 1 = 2
  2 x 2 = 4
  2 x 3 = 6
Table de 3 :
  3 x 1 = 3
  3 x 2 = 6
  3 x 3 = 9`,
      steps: [
        "<code>for (int table = 2; table &lt;= 3; table++)</code> : la boucle extérieure choisit la table (2, puis 3).",
        "<code>Console.WriteLine($\"Table de {table} :\")</code> : un titre, affiché une fois par table.",
        "<code>for (int i = 1; i &lt;= 3; i++)</code> : la boucle intérieure repart de 1 à chaque nouvelle table.",
        "<code>{table * i}</code> : on calcule le produit directement dans l'interpolation."
      ],
      explain: "2 tours extérieurs × 3 tours intérieurs = 6 lignes de calcul."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les nombres pairs",
      prompt: "<p>Avec une boucle <code>for</code>, affiche les nombres pairs de 0 à 10 (0, 2, 4, 6, 8, 10), un par ligne.</p>",
      hint: "<p>Le pas n'est pas obligé d'être <code>i++</code> : tu peux écrire <code>i += 2</code>.</p>",
      solution: `for (int i = 0; i <= 10; i += 2)
{
    Console.WriteLine(i);
}`
    },
    {
      level: "moyen",
      title: "La somme de 1 à 100",
      prompt: "<p>Avec une boucle <code>while</code>, calcule la somme 1 + 2 + ... + 100 et affiche-la. Tu dois obtenir 5050.</p>",
      hint: "<p>Il te faut deux variables : un compteur qui va de 1 à 100 et un total qui commence à 0. N'oublie pas de faire avancer le compteur.</p>",
      solution: `int counter = 1;
int total = 0;
while (counter <= 100)
{
    total += counter;
    counter++;
}
Console.WriteLine($"Somme : {total}");`
    },
    {
      level: "difficile",
      title: "Le nombre mystère",
      prompt: "<p>Le nombre mystère est 7. Avec une boucle <code>do while</code>, demande un nombre à l'utilisateur jusqu'à ce qu'il trouve. Indique « Plus grand » ou « Plus petit » à chaque essai, et affiche le nombre d'essais à la fin. Si la saisie n'est pas un nombre, affiche « Ce n'est pas un nombre ».</p>",
      hint: "<p>Utilise <code>int.TryParse</code> (vu en 2.4) pour lire la saisie. Déclare la variable du nombre saisi <strong>avant</strong> le <code>do</code>, sinon le <code>while</code> final ne la voit pas.</p>",
      solution: `const int Secret = 7;
int guess = 0;
int attempts = 0;
do
{
    Console.Write("Ton nombre : ");
    if (!int.TryParse(Console.ReadLine(), out guess))
    {
        Console.WriteLine("Ce n'est pas un nombre");
        continue;
    }
    attempts++;
    if (guess < Secret) Console.WriteLine("Plus grand");
    else if (guess > Secret) Console.WriteLine("Plus petit");
} while (guess != Secret);
Console.WriteLine($"Trouvé en {attempts} essais !");`
    }
  ],
  quiz: [
    {
      q: "Combien de fois s'exécute le corps de <code>for (int i = 0; i &lt; 4; i++)</code> ?",
      options: ["3 fois", "4 fois", "5 fois"],
      answer: 1,
      why: "i prend les valeurs 0, 1, 2 et 3, soit 4 tours. Quand i vaut 4, <code>i &lt; 4</code> est faux. Le piège « 5 fois » viendrait d'un <code>&lt;=</code>."
    },
    {
      q: "Quelle boucle exécute son corps au moins une fois, même si la condition est fausse ?",
      options: ["while", "for", "do while"],
      answer: 2,
      why: "do while exécute le corps puis teste la condition. while et for testent avant, donc peuvent faire zéro tour."
    },
    {
      q: "Que se passe-t-il avec <code>int x = 0; while (x &lt; 3) { Console.WriteLine(x); }</code> ?",
      options: ["Une boucle infinie qui affiche 0 sans fin", "Le programme affiche 0, 1, 2", "Une erreur de compilation"],
      answer: 0,
      why: "Rien ne modifie x dans le corps : la condition reste vraie pour toujours. Il manque un <code>x++</code>. Le code compile parfaitement, c'est ce qui rend ce bug sournois."
    },
    {
      q: "Deux boucles imbriquées font chacune 4 tours. Combien de fois le corps intérieur s'exécute-t-il ?",
      options: ["8", "16", "4"],
      answer: 1,
      why: "La boucle intérieure fait ses 4 tours pour chacun des 4 tours extérieurs : 4 × 4 = 16. On ne les additionne pas."
    }
  ],
  project: `<p>Crée le menu de ta Bibliothèque avec une boucle <code>do while</code>. Affiche « 1. Lister les livres », « 2. Ajouter un livre », « 0. Quitter », lis le choix avec <code>Console.ReadLine()</code>, affiche « Choix : X » pour 1 et 2, et recommence tant que le choix n'est pas <code>"0"</code>. Termine par « Au revoir ! ».</p>`,
  resources: [
    { label: "Instructions d'itération (for, while, do)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/iteration-statements" }
  ]
});

/* ============================================================
   2.9 foreach, break et continue
   ============================================================ */
window.COURSE.push({
  key: "l-foreach",
  title: "foreach, break et continue",
  summary: "Tu sauras parcourir chaque élément d'une chaîne ou d'un tableau avec foreach, et contrôler une boucle avec break et continue.",
  objectives: [
    "Parcourir une chaîne et un tableau avec foreach",
    "Comprendre que la variable d'itération est en lecture seule",
    "Sortir d'une boucle avec break, sauter un tour avec continue",
    "Choisir entre for et foreach"
  ],
  analogy: `<p>Imagine que tu distribues des copies à une rangée d'élèves. Tu ne comptes pas « élève numéro 0, numéro 1… » : tu passes simplement devant <strong>chacun</strong>, l'un après l'autre. C'est <code>foreach</code> (« pour chaque »).</p>
<p>Si un élève est absent, tu passes au suivant : c'est <code>continue</code>. Si tu n'as plus de copies, tu arrêtes la distribution : c'est <code>break</code>.</p>`,
  lesson: `<h3>foreach : pour chaque élément</h3>
<p>Une <strong>collection</strong> est un objet qui contient plusieurs valeurs : une chaîne (plusieurs caractères), un tableau (plusieurs nombres, plusieurs titres…). <code>foreach</code> les parcourt une par une, du début à la fin, sans compteur à gérer.</p>
<pre class="diagram">foreach (char letter in word)
         ----------    ----
             |           |
   variable d'itération  collection parcourue
   (change à chaque tour)</pre>
<p>À chaque tour, <code>letter</code> reçoit l'élément suivant. Quand il n'y a plus d'éléments, la boucle s'arrête toute seule. Impossible de déborder ou d'oublier un élément.</p>

<h3>Sur une chaîne et sur un tableau</h3>
<p>Une <code>string</code> est une suite de <code>char</code> : <code>foreach (char c in "Livre")</code> te donne <code>'L'</code>, <code>'i'</code>, <code>'v'</code>, <code>'r'</code>, <code>'e'</code>. Pour un tableau de nombres, c'est pareil : <code>foreach (int note in notes)</code>. Un tableau s'écrit par exemple <code>int[] notes = [12, 15, 18];</code>. On ne fait ici qu'en profiter : tout sera détaillé dans la leçon suivante.</p>

<h3>Comparaison avec TypeScript</h3>
<div class="compare"><div><h4>TypeScript</h4><p><code>for (const note of notes) { ... }</code></p></div><div><h4>C#</h4><p><code>foreach (int note in notes) { ... }</code></p></div></div>
<p>Attention au mot : en C# c'est <code>in</code>, alors qu'en TypeScript <code>for...in</code> parcourt les <strong>clés</strong> et c'est <code>for...of</code> qui parcourt les valeurs. Le <code>foreach ... in</code> de C# correspond donc à <code>for...of</code>. Tu peux aussi écrire <code>foreach (var note in notes)</code> : le compilateur devine le type.</p>

<h3>La variable d'itération est en lecture seule</h3>
<p>Comme le <code>const</code> de ton <code>for (const x of ...)</code>, la variable de <code>foreach</code> ne peut pas être modifiée. <code>letter = 'X';</code> provoque une erreur de compilation. Pour modifier les éléments d'un tableau, il faut passer par leur position avec un <code>for</code> classique.</p>
<p>Pourquoi cette règle ? Parce que la variable reçoit une <strong>copie</strong> de l'élément à chaque tour. La modifier ne changerait rien dans la collection, et ce serait trompeur : le compilateur préfère t'arrêter tout de suite. Tu peux en revanche créer d'autres variables dans le corps de la boucle, faire des calculs et des affichages, comme d'habitude.</p>

<h3>break et continue</h3>
<p>Ces deux mots fonctionnent dans toutes les boucles (<code>for</code>, <code>while</code>, <code>do while</code>, <code>foreach</code>) :</p>
<table>
<tr><th>Mot-clé</th><th>Effet</th><th>Exemple d'usage</th></tr>
<tr><td><code>break</code></td><td>Quitte la boucle immédiatement</td><td>On a trouvé ce qu'on cherchait</td></tr>
<tr><td><code>continue</code></td><td>Abandonne le tour en cours et passe au suivant</td><td>Une valeur invalide à ignorer</td></tr>
</table>
<div class="flow"><span>Élément suivant</span><span>Invalide ? continue</span><span>Fini ? break</span><span>Traitement</span></div>
<div class="tip"><code>break</code> ne sort que de la boucle <strong>la plus proche</strong>. Dans deux boucles imbriquées, un <code>break</code> dans la boucle intérieure ne fait que passer au tour suivant de la boucle extérieure.</div>

<h3>for ou foreach ?</h3>
<p>Choisis <code>foreach</code> par défaut : c'est plus court et sans risque d'erreur d'index. Prends <code>for</code> quand tu as besoin de la <strong>position</strong> (afficher « 1. Dune »), de modifier les éléments, de parcourir à l'envers ou de sauter des cases (une sur deux).</p>
<div class="note">En entreprise, un <code>foreach</code> se lit d'un coup d'œil, alors qu'un <code>for</code> oblige à vérifier les bornes (<code>&lt;</code> ou <code>&lt;=</code> ?). Les relecteurs de code préfèrent donc <code>foreach</code> dès que l'index ne sert à rien.</div>`,
  examples: [
    {
      title: "Parcourir une chaîne",
      code: `string word = "Livre";
int count = 0;
foreach (char letter in word)
{
    count++;
    Console.WriteLine($"Lettre {count} : {letter}");
}`,
      output: `Lettre 1 : L
Lettre 2 : i
Lettre 3 : v
Lettre 4 : r
Lettre 5 : e`,
      steps: [
        "<code>string word = \"Livre\";</code> : une chaîne est une suite de 5 caractères.",
        "<code>foreach (char letter in word)</code> : à chaque tour, <code>letter</code> reçoit le caractère suivant.",
        "<code>count++;</code> : foreach ne donne pas de position, alors on compte nous-mêmes.",
        "<code>Console.WriteLine($\"Lettre {count} : {letter}\")</code> : on affiche la position et le caractère."
      ],
      explain: "Aucun index à gérer : foreach s'arrête tout seul après la dernière lettre."
    },
    {
      title: "Ignorer et arrêter avec continue et break",
      code: `int[] grades = [12, -1, 15, 99, 18];
int total = 0;
foreach (int grade in grades)
{
    if (grade < 0)
    {
        Console.WriteLine($"{grade} ignorée");
        continue;
    }
    if (grade == 99)
    {
        Console.WriteLine("Marqueur de fin");
        break;
    }
    total += grade;
    Console.WriteLine($"Ajout de {grade}, total = {total}");
}
Console.WriteLine($"Total final : {total}");`,
      output: `Ajout de 12, total = 12
-1 ignorée
Ajout de 15, total = 27
Marqueur de fin
Total final : 27`,
      steps: [
        "<code>int[] grades = [12, -1, 15, 99, 18];</code> : un tableau de notes, avec une note invalide (-1) et un marqueur de fin (99).",
        "<code>if (grade &lt; 0) { ... continue; }</code> : pour -1, on affiche un message et on saute directement au tour suivant. La ligne <code>total += grade</code> n'est pas exécutée.",
        "<code>if (grade == 99) { ... break; }</code> : en tombant sur 99, on quitte la boucle. Le 18 n'est jamais lu.",
        "<code>total += grade;</code> : seules les notes valides avant le marqueur sont additionnées : 12 + 15 = 27.",
        "<code>Console.WriteLine($\"Total final : {total}\")</code> : après le break, le programme reprend juste après la boucle."
      ]
    },
    {
      title: "Quand il faut la position : for",
      code: `string[] titles = ["Dune", "Fondation", "Akira"];

foreach (string title in titles)
{
    Console.WriteLine(title);
}

for (int i = 0; i < titles.Length; i++)
{
    Console.WriteLine($"{i + 1}. {titles[i]}");
}`,
      output: `Dune
Fondation
Akira
1. Dune
2. Fondation
3. Akira`,
      steps: [
        "<code>string[] titles = [...]</code> : un tableau de trois titres.",
        "<code>foreach (string title in titles)</code> : idéal pour simplement afficher chaque titre.",
        "<code>for (int i = 0; i &lt; titles.Length; i++)</code> : <code>Length</code> donne le nombre d'éléments (3). Les positions vont de 0 à 2.",
        "<code>titles[i]</code> : on lit l'élément à la position <code>i</code>, et <code>i + 1</code> donne une numérotation humaine qui commence à 1."
      ],
      explain: "Même résultat de parcours, mais seul for donne accès au numéro."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter les voyelles",
      prompt: "<p>Avec <code>foreach</code>, compte le nombre de <code>'a'</code> dans la chaîne <code>\"abracadabra\"</code> et affiche le résultat (tu dois trouver 5).</p>",
      hint: "<p>Compare chaque caractère avec <code>'a'</code> (guillemets simples pour un <code>char</code>) et incrémente un compteur.</p>",
      solution: `string text = "abracadabra";
int count = 0;
foreach (char c in text)
{
    if (c == 'a') count++;
}
Console.WriteLine($"Nombre de a : {count}");`
    },
    {
      level: "moyen",
      title: "Le premier titre long",
      prompt: "<p>Dans le tableau <code>[\"Dune\", \"Akira\", \"Fondation\", \"Hypérion\"]</code>, trouve le premier titre de plus de 6 caractères, affiche-le et arrête la recherche.</p>",
      hint: "<p>Une chaîne a une propriété <code>Length</code>. Dès que tu trouves, utilise <code>break</code>.</p>",
      solution: `string[] titles = ["Dune", "Akira", "Fondation", "Hypérion"];
foreach (string title in titles)
{
    if (title.Length > 6)
    {
        Console.WriteLine($"Trouvé : {title}");
        break;
    }
}`
    },
    {
      level: "difficile",
      title: "Somme des positifs, arrêt sur zéro",
      prompt: "<p>Parcours <code>[4, -2, 7, -5, 3, 0, 8]</code>. Ignore les nombres négatifs avec <code>continue</code>, arrête-toi au premier 0 avec <code>break</code>, et affiche la somme des nombres retenus ainsi que leur nombre (somme 14, 3 nombres).</p>",
      hint: "<p>Deux variables avant la boucle : <code>sum</code> et <code>kept</code>. Place le test du 0 avant ou après celui des négatifs, les deux marchent ici.</p>",
      solution: `int[] numbers = [4, -2, 7, -5, 3, 0, 8];
int sum = 0;
int kept = 0;
foreach (int n in numbers)
{
    if (n == 0) break;
    if (n < 0) continue;
    sum += n;
    kept++;
}
Console.WriteLine($"Somme : {sum} ({kept} nombres)");`
    }
  ],
  quiz: [
    {
      q: "À quoi correspond <code>foreach (var x in items)</code> de C# en TypeScript ?",
      options: ["<code>for (const x in items)</code>", "<code>for (const x of items)</code>", "<code>items.map(x =&gt; x)</code>"],
      answer: 1,
      why: "Le foreach de C# parcourt les valeurs, comme <code>for...of</code>. Le piège : en TS, <code>for...in</code> parcourt les clés, malgré le même mot <code>in</code>."
    },
    {
      q: "Que fait <code>continue</code> dans une boucle ?",
      options: ["Il arrête complètement la boucle", "Il recommence la boucle depuis le premier élément", "Il abandonne le tour en cours et passe au suivant"],
      answer: 2,
      why: "continue saute la fin du tour actuel et enchaîne sur le prochain élément. C'est break qui arrête la boucle entière."
    },
    {
      q: "Que se passe-t-il si tu écris <code>letter = 'X';</code> dans <code>foreach (char letter in word)</code> ?",
      options: ["Une erreur de compilation", "La lettre est modifiée dans la chaîne", "Rien, la ligne est ignorée"],
      answer: 0,
      why: "La variable d'itération est en lecture seule : le compilateur refuse l'affectation. Pour modifier des éléments, il faut un for avec un index."
    }
  ],
  resources: [
    { label: "L'instruction foreach", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/iteration-statements#the-foreach-statement" },
    { label: "Instructions de saut (break, continue)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/jump-statements" }
  ]
});

/* ============================================================
   2.10 Tableaux
   ============================================================ */
window.COURSE.push({
  key: "l-arrays",
  title: "Tableaux",
  summary: "Tu sauras créer, remplir, lire, trier et parcourir un tableau de taille fixe en C#.",
  objectives: [
    "Déclarer un tableau avec new int[5], { } ou [1, 2, 3]",
    "Lire un élément par son index, depuis le début ou la fin (^1)",
    "Extraire une plage avec [1..3] et éviter IndexOutOfRangeException",
    "Utiliser Array.Sort, Array.IndexOf et Array.Reverse"
  ],
  analogy: `<p>Un tableau, c'est une rangée de casiers numérotés à la piscine. Le nombre de casiers est fixé à la construction : on ne peut pas en ajouter un de plus. Chaque casier contient une seule chose, et tous contiennent le même type d'objet.</p>
<p>Petite bizarrerie : le premier casier porte le numéro 0, pas 1. Et si tu demandes le casier 10 dans une rangée de 5, le gardien refuse : c'est une erreur.</p>`,
  lesson: `<h3>Déclarer un tableau</h3>
<p>Un <strong>tableau</strong> (array) regroupe plusieurs valeurs <strong>du même type</strong> dans une seule variable. Son type s'écrit avec des crochets : <code>int[]</code> veut dire « tableau d'entiers », <code>string[]</code> « tableau de chaînes ». Il y a trois façons courantes de le créer :</p>
<table>
<tr><th>Syntaxe</th><th>Résultat</th></tr>
<tr><td><code>int[] a = new int[5];</code></td><td>5 cases, toutes à la valeur par défaut</td></tr>
<tr><td><code>int[] b = { 1, 2, 3 };</code></td><td>3 cases déjà remplies (syntaxe classique)</td></tr>
<tr><td><code>int[] c = [1, 2, 3];</code></td><td>Pareil, avec une <strong>collection expression</strong> (C# 12+), la syntaxe moderne</td></tr>
</table>
<p>Avec <code>new int[5]</code>, chaque case reçoit la <strong>valeur par défaut</strong> de son type : <code>0</code> pour les nombres, <code>false</code> pour un <code>bool</code>, <code>'\\0'</code> pour un <code>char</code> et <code>null</code> (aucune valeur) pour une <code>string</code>. Contrairement à TypeScript, il n'y a jamais de case <code>undefined</code>.</p>

<h3>Les cases en mémoire</h3>
<p>Les éléments sont rangés côte à côte. On accède à une case par son <strong>index</strong> (sa position), entre crochets, en commençant à 0. <code>Length</code> donne le nombre de cases. L'opérateur <code>^</code> compte depuis la fin : <code>^1</code> est le dernier élément.</p>
<pre class="diagram">int[] numbers = [10, 20, 30, 40, 50];

 index     :  0    1    2    3    4
            +----+----+----+----+----+
            | 10 | 20 | 30 | 40 | 50 |
            +----+----+----+----+----+
 depuis fin: ^5   ^4   ^3   ^2   ^1

 numbers.Length = 5    dernier index = 4</pre>
<p>Pour modifier une case : <code>numbers[0] = 99;</code>. Pour la lire : <code>numbers[2]</code> vaut 30.</p>

<h3>Le piège : IndexOutOfRangeException</h3>
<p>Le dernier index valide est <code>Length - 1</code>. Lire <code>numbers[5]</code> sur un tableau de 5 cases ne renvoie pas <code>undefined</code> comme en JavaScript : le programme plante avec une <strong>exception</strong> (une erreur qui arrête le programme) nommée <code>IndexOutOfRangeException</code>.</p>
<div class="tip">Dans un <code>for</code>, écris <code>i &lt; tableau.Length</code>, jamais <code>i &lt;= tableau.Length</code>. Le <code>&lt;=</code> fait un tour de trop et déclenche l'exception au dernier tour.</div>

<h3>Les plages</h3>
<p>Une <strong>plage</strong> (range) extrait un morceau du tableau : <code>numbers[1..3]</code> renvoie un nouveau tableau avec les index 1 et 2, soit <code>[20, 30]</code>. Le début est inclus, la fin est exclue, comme <code>slice(1, 3)</code> en TypeScript. On peut omettre un bout : <code>numbers[..2]</code> (les deux premiers), <code>numbers[3..]</code> (à partir de l'index 3), <code>numbers[^2..]</code> (les deux derniers).</p>

<h3>Parcourir et manipuler</h3>
<p>On parcourt un tableau avec <code>foreach</code> (lecture simple) ou <code>for</code> (besoin de l'index ou de modifier). La classe <code>Array</code> fournit des outils prêts à l'emploi :</p>
<ul>
<li><code>Array.Sort(numbers)</code> : trie le tableau sur place (il est modifié).</li>
<li><code>Array.IndexOf(numbers, 30)</code> : renvoie l'index de la valeur, ou <code>-1</code> si elle est absente.</li>
<li><code>Array.Reverse(numbers)</code> : inverse l'ordre sur place.</li>
</ul>

<h3>Taille fixe, List et tableaux 2D</h3>
<p>Un tableau ne peut ni grandir ni rétrécir. Pour une collection qui change de taille (ajouter un livre, en retirer un), on utilisera <code>List&lt;T&gt;</code>, l'équivalent du tableau JavaScript, que tu verras en détail au chapitre 5. En aperçu, C# a aussi des tableaux à deux dimensions, comme une grille : <code>int[,] grid = new int[2, 3];</code> (2 lignes, 3 colonnes), et on écrit <code>grid[1, 2] = 5;</code>.</p>
<div class="note">Dans du code professionnel, on réserve le tableau aux données de taille connue et stable (les 12 mois, les jours de la semaine, un résultat qu'on ne modifiera plus). Dès que la taille bouge, <code>List&lt;T&gt;</code> est le bon choix.</div>`,
  examples: [
    {
      title: "Créer un tableau et ses valeurs par défaut",
      code: `int[] stock = new int[3];
Console.WriteLine($"Avant : {stock[0]}, {stock[1]}, {stock[2]}");

stock[0] = 4;
stock[2] = 7;
Console.WriteLine($"Après : {stock[0]}, {stock[1]}, {stock[2]}");
Console.WriteLine($"Taille : {stock.Length}");

string[] names = new string[2];
Console.WriteLine(names[0] is null);`,
      output: `Avant : 0, 0, 0
Après : 4, 0, 7
Taille : 3
True`,
      steps: [
        "<code>int[] stock = new int[3];</code> : trois cases d'entiers, toutes initialisées à 0.",
        "<code>stock[0] = 4;</code> et <code>stock[2] = 7;</code> : on remplit la première et la dernière case. La case 1 reste à 0.",
        "<code>stock.Length</code> : le nombre de cases, ici 3. Il ne changera jamais.",
        "<code>string[] names = new string[2];</code> : pour des chaînes, la valeur par défaut est <code>null</code>.",
        "<code>names[0] is null</code> : vaut <code>true</code>, que la console affiche <code>True</code>."
      ]
    },
    {
      title: "Index depuis la fin et plages",
      code: `int[] numbers = [10, 20, 30, 40, 50];

Console.WriteLine(numbers[0]);
Console.WriteLine(numbers[^1]);
Console.WriteLine(numbers[numbers.Length - 1]);

int[] middle = numbers[1..3];
Console.WriteLine(string.Join(", ", middle));

int[] lastTwo = numbers[^2..];
Console.WriteLine(string.Join(", ", lastTwo));`,
      output: `10
50
50
20, 30
40, 50`,
      steps: [
        "<code>int[] numbers = [10, 20, 30, 40, 50];</code> : une collection expression crée et remplit le tableau.",
        "<code>numbers[^1]</code> : le dernier élément, 50. C'est plus lisible que l'ancienne forme <code>numbers[numbers.Length - 1]</code>.",
        "<code>numbers[1..3]</code> : les index 1 et 2 (la fin 3 est exclue), soit 20 et 30.",
        "<code>string.Join(\", \", middle)</code> : colle les éléments avec un séparateur pour les afficher (on le reverra en 2.13).",
        "<code>numbers[^2..]</code> : de l'avant-dernier jusqu'à la fin, soit 40 et 50."
      ]
    },
    {
      title: "Trier, chercher, inverser",
      code: `int[] ages = [42, 7, 19, 3];

Array.Sort(ages);
Console.WriteLine(string.Join(" ", ages));

int position = Array.IndexOf(ages, 19);
Console.WriteLine($"19 est à l'index {position}");
Console.WriteLine($"100 est à l'index {Array.IndexOf(ages, 100)}");

Array.Reverse(ages);
foreach (int age in ages)
{
    Console.Write($"{age} ");
}
Console.WriteLine();`,
      output: `3 7 19 42
19 est à l'index 2
100 est à l'index -1
42 19 7 3 `,
      steps: [
        "<code>Array.Sort(ages);</code> : trie le tableau lui-même, par ordre croissant. Il ne renvoie rien.",
        "<code>Array.IndexOf(ages, 19)</code> : après le tri, 19 est en position 2.",
        "<code>Array.IndexOf(ages, 100)</code> : la valeur est absente, on obtient -1 (comme <code>indexOf</code> en TypeScript).",
        "<code>Array.Reverse(ages);</code> : inverse l'ordre sur place.",
        "<code>Console.Write($\"{age} \")</code> : <code>Write</code> n'ajoute pas de retour à la ligne, d'où l'espace final, puis <code>Console.WriteLine()</code> termine la ligne."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Premier et dernier",
      prompt: "<p>Crée un tableau <code>[\"lundi\", \"mardi\", \"mercredi\", \"jeudi\", \"vendredi\"]</code> et affiche son nombre d'éléments, le premier et le dernier jour (avec <code>^1</code>).</p>",
      hint: "<p><code>Length</code> pour la taille, <code>[0]</code> pour le premier, <code>[^1]</code> pour le dernier.</p>",
      solution: `string[] days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
Console.WriteLine($"{days.Length} jours");
Console.WriteLine($"Premier : {days[0]}");
Console.WriteLine($"Dernier : {days[^1]}");`
    },
    {
      level: "moyen",
      title: "Moyenne et maximum",
      prompt: "<p>Avec le tableau <code>[12, 8, 15, 19, 11]</code>, calcule la somme, la moyenne (en <code>double</code>) et la plus grande valeur, avec une seule boucle <code>foreach</code>.</p>",
      hint: "<p>Initialise le maximum avec le premier élément <code>grades[0]</code>. Pour la moyenne, convertis la somme : <code>(double)sum / grades.Length</code>.</p>",
      solution: `int[] grades = [12, 8, 15, 19, 11];
int sum = 0;
int max = grades[0];
foreach (int g in grades)
{
    sum += g;
    if (g > max) max = g;
}
double average = (double)sum / grades.Length;
Console.WriteLine($"Somme : {sum}, moyenne : {average}, max : {max}");`
    },
    {
      level: "difficile",
      title: "Doubler sur place",
      prompt: "<p>Avec un <code>for</code>, double chaque valeur du tableau <code>[1, 2, 3, 4]</code> directement dans le tableau, puis affiche-le trié dans l'ordre décroissant. Explique en commentaire pourquoi <code>foreach</code> ne permettait pas de modifier les cases.</p>",
      hint: "<p><code>values[i] *= 2;</code> modifie la case. Pour l'ordre décroissant : <code>Array.Sort</code> puis <code>Array.Reverse</code>.</p>",
      solution: `int[] values = [1, 2, 3, 4];
// foreach donne une variable en lecture seule : on ne peut pas réécrire la case
for (int i = 0; i < values.Length; i++)
{
    values[i] *= 2;
}
Array.Sort(values);
Array.Reverse(values);
Console.WriteLine(string.Join(", ", values));`
    }
  ],
  quiz: [
    {
      q: "Que contient <code>new bool[3]</code> juste après sa création ?",
      options: ["Trois cases undefined", "Trois cases false", "Un tableau vide de longueur 0"],
      answer: 1,
      why: "Chaque case reçoit la valeur par défaut du type, false pour un bool. undefined n'existe pas en C#, et la longueur est bien 3."
    },
    {
      q: "Avec <code>int[] t = [5, 6, 7, 8];</code>, que vaut <code>t[1..3]</code> ?",
      options: ["[5, 6, 7]", "[6, 7, 8]", "[6, 7]"],
      answer: 2,
      why: "Le début (1) est inclus et la fin (3) exclue : on prend les index 1 et 2, soit 6 et 7. Même règle que slice en TypeScript."
    },
    {
      q: "Que se passe-t-il en lisant <code>t[4]</code> sur un tableau de 4 éléments ?",
      options: ["Une IndexOutOfRangeException à l'exécution", "La valeur 0 est renvoyée", "Une erreur de compilation"],
      answer: 0,
      why: "Les index valides vont de 0 à 3. Le compilateur ne vérifie pas les index : c'est à l'exécution que le programme plante. JavaScript aurait renvoyé undefined, pas C#."
    },
    {
      q: "Que renvoie <code>t[^1]</code> ?",
      options: ["Le premier élément", "Le dernier élément", "L'avant-dernier élément"],
      answer: 1,
      why: "^1 signifie « 1 depuis la fin », donc le dernier élément. ^2 serait l'avant-dernier."
    }
  ],
  project: `<p>Dans ta Bibliothèque, crée un tableau <code>string[] books = new string[5];</code> pour 5 emplacements. Place trois titres dans les cases 0 à 2, puis affiche la liste numérotée avec un <code>for</code> en ignorant les cases vides (<code>null</code>) avec <code>continue</code>. Affiche enfin « 3 livres sur 5 places ».</p>`,
  resources: [
    { label: "Tableaux en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/arrays" },
    { label: "Index et plages", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/tutorials/ranges-indexes" }
  ]
});

/* ============================================================
   2.11 Méthodes : les bases
   ============================================================ */
window.COURSE.push({
  key: "l-methods",
  title: "Méthodes : les bases",
  summary: "Tu sauras écrire et appeler tes propres méthodes, avec des paramètres et une valeur de retour.",
  objectives: [
    "Lire une signature : type de retour, nom, paramètres",
    "Distinguer une méthode void d'une méthode qui retourne une valeur",
    "Écrire des fonctions locales dans un programme top-level",
    "Utiliser la syntaxe courte => et la convention PascalCase"
  ],
  analogy: `<p>Une méthode, c'est une recette de cuisine. Tu l'écris une fois avec un nom (« Crêpes »), une liste d'ingrédients (les paramètres) et un plat final (la valeur de retour). Ensuite, pour cuisiner, tu dis juste « fais des crêpes pour 4 », sans réexpliquer chaque étape.</p>
<p>Certaines recettes ne produisent rien à rapporter, comme « mettre la table » : c'est une méthode <code>void</code>.</p>`,
  lesson: `<h3>Pourquoi des méthodes ?</h3>
<p>Une <strong>méthode</strong> est un bloc de code nommé qu'on peut exécuter quand on veut, autant de fois qu'on veut. C'est l'équivalent d'une <code>function</code> en TypeScript. Elle sert à deux choses : <strong>ne pas répéter</strong> le même code à plusieurs endroits, et <strong>nommer une intention</strong>. Lire <code>CalculerTva(prix)</code> est plus clair que de déchiffrer trois lignes de calcul.</p>

<h3>La signature décortiquée</h3>
<p>La première ligne d'une méthode s'appelle sa <strong>signature</strong>. En C#, le type de retour vient <strong>avant</strong> le nom, alors qu'en TypeScript il vient après.</p>
<pre class="diagram">  int    Add  ( int a, int b )
  ---    ---    --------------
   |      |           |
   |      |     paramètres : type + nom
   |     nom de la méthode (PascalCase)
  type de la valeur renvoyée</pre>
<div class="compare"><div><h4>TypeScript</h4><p><code>function add(a: number, b: number): number { return a + b; }</code></p></div><div><h4>C#</h4><p><code>int Add(int a, int b) { return a + b; }</code></p></div></div>
<p>Pas de mot-clé <code>function</code> : c'est le type de retour qui annonce qu'on déclare une méthode. Chaque paramètre doit avoir un type, il n'y a pas d'inférence ici.</p>

<h3>void et return</h3>
<p><code>void</code> signifie « ne renvoie rien » : la méthode agit (elle affiche, elle modifie) mais ne rapporte pas de valeur. Si le type de retour est autre chose, comme <code>int</code> ou <code>string</code>, le mot-clé <code>return</code> est <strong>obligatoire</strong> sur tous les chemins : le compilateur refuse une méthode <code>int</code> qui pourrait se terminer sans rien renvoyer. <code>return</code> arrête aussi immédiatement la méthode ; dans une méthode <code>void</code>, un simple <code>return;</code> permet de sortir plus tôt.</p>
<div class="flow"><span>Appel Add(3, 4)</span><span>a = 3, b = 4</span><span>return a + b</span><span>L'appel vaut 7</span></div>

<h3>Fonctions locales et portée</h3>
<p>Dans un <code>Program.cs</code> en top-level statements (sans <code>class Program</code> ni <code>Main</code>), les méthodes que tu écris sont des <strong>fonctions locales</strong>. Tu peux les déclarer en bas du fichier et les appeler plus haut : C# les connaît dès le début, comme les <code>function</code> hissées de JavaScript.</p>
<p>La <strong>portée</strong> d'une variable, c'est la zone du code où elle existe. Une variable déclarée dans une méthode (ou un paramètre) n'existe que dans cette méthode, entre ses accolades. Deux méthodes peuvent donc avoir chacune leur variable <code>total</code> sans conflit.</p>
<div class="tip">Une fonction locale peut lire les variables du programme principal qui l'entoure. C'est pratique mais piégeux : elle dépend alors d'un état caché. Passe plutôt les valeurs en paramètres, et ajoute <code>static</code> devant la fonction (<code>static int Add(...)</code>) pour que le compilateur interdise cet accès.</div>

<h3>La syntaxe courte =&gt;</h3>
<p>Quand une méthode tient en une seule expression, on peut remplacer les accolades et le <code>return</code> par une flèche : <code>int Add(int a, int b) =&gt; a + b;</code>. C'est une méthode <strong>expression-bodied</strong>, l'équivalent des fonctions fléchées courtes de TypeScript. Le <code>return</code> est implicite.</p>

<h3>Nommer ses méthodes</h3>
<p>En C#, les méthodes s'écrivent en <strong>PascalCase</strong> : chaque mot commence par une majuscule, y compris le premier (<code>DisplayMenu</code>, <code>AddBook</code>). Les paramètres et variables locales restent en camelCase (<code>bookTitle</code>). Choisis un verbe : une méthode <em>fait</em> quelque chose.</p>
<div class="note">Une bonne méthode fait <strong>une seule chose</strong> et tient sur un écran. Si tu dois écrire « et » pour décrire ce qu'elle fait (« calcule le prix et affiche le ticket »), découpe-la en deux : c'est plus facile à relire, à réutiliser et à tester.</div>`,
  examples: [
    {
      title: "Une méthode void avec un paramètre",
      code: `SayHello("Kamal");
SayHello("Lina");

void SayHello(string name)
{
    Console.WriteLine($"Bonjour {name} !");
}`,
      output: `Bonjour Kamal !
Bonjour Lina !`,
      steps: [
        "<code>SayHello(\"Kamal\");</code> : on appelle la méthode avec l'argument <code>\"Kamal\"</code>, avant même sa déclaration.",
        "<code>void SayHello(string name)</code> : la méthode ne renvoie rien (<code>void</code>) et attend une chaîne nommée <code>name</code>.",
        "<code>Console.WriteLine($\"Bonjour {name} !\")</code> : le corps utilise le paramètre, qui vaut <code>\"Kamal\"</code> au premier appel et <code>\"Lina\"</code> au second."
      ],
      explain: "Écrite une fois, utilisée deux fois avec des valeurs différentes."
    },
    {
      title: "Renvoyer une valeur avec return",
      code: `int total = Add(3, 4);
Console.WriteLine(total);
Console.WriteLine(Add(10, 5) * 2);
Console.WriteLine(Describe(-3));

int Add(int a, int b)
{
    return a + b;
}

string Describe(int number)
{
    if (number < 0)
    {
        return "négatif";
    }
    return "positif ou nul";
}`,
      output: `7
30
négatif`,
      steps: [
        "<code>int total = Add(3, 4);</code> : l'appel est remplacé par la valeur renvoyée, 7, qu'on range dans <code>total</code>.",
        "<code>Add(10, 5) * 2</code> : un appel s'utilise comme n'importe quelle valeur dans une expression : 15 × 2 = 30.",
        "<code>int Add(int a, int b)</code> : type de retour <code>int</code>, donc un <code>return</code> est obligatoire.",
        "<code>return \"négatif\";</code> : pour -3, la méthode s'arrête ici. La dernière ligne n'est pas exécutée.",
        "<code>return \"positif ou nul\";</code> : ce second <code>return</code> couvre l'autre chemin. Sans lui, le compilateur refuserait le code."
      ]
    },
    {
      title: "La syntaxe courte =>",
      code: `double price = 20;
Console.WriteLine(ApplyDiscount(price, 10));
Console.WriteLine(IsAdult(17));
Console.WriteLine(IsAdult(30));

static double ApplyDiscount(double amount, double percent) => amount - amount * percent / 100;
static bool IsAdult(int age) => age >= 18;`,
      output: `18
False
True`,
      steps: [
        "<code>ApplyDiscount(price, 10)</code> : 20 - 20 × 10 / 100 = 18. Un <code>double</code> sans décimale s'affiche <code>18</code>.",
        "<code>static double ApplyDiscount(...) =&gt; ...;</code> : une seule expression, donc pas d'accolades ni de <code>return</code>. <code>static</code> garantit qu'elle n'utilise que ses paramètres.",
        "<code>static bool IsAdult(int age) =&gt; age &gt;= 18;</code> : renvoie directement le résultat de la comparaison.",
        "<code>Console.WriteLine(IsAdult(17))</code> : la console affiche les booléens avec une majuscule, <code>False</code> et <code>True</code>."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le carré",
      prompt: "<p>Écris une méthode <code>Square</code> qui reçoit un <code>int</code> et renvoie son carré. Affiche <code>Square(5)</code> et <code>Square(12)</code>.</p>",
      hint: "<p>Une seule expression : la syntaxe <code>=&gt;</code> est parfaite.</p>",
      solution: `Console.WriteLine(Square(5));
Console.WriteLine(Square(12));

static int Square(int n) => n * n;`
    },
    {
      level: "moyen",
      title: "Le plus grand de trois",
      prompt: "<p>Écris <code>Max3(int a, int b, int c)</code> qui renvoie le plus grand des trois nombres, en réutilisant une méthode <code>Max2(int a, int b)</code> que tu écris aussi.</p>",
      hint: "<p>Le plus grand de trois, c'est le plus grand entre <code>a</code> et le plus grand de <code>b</code> et <code>c</code>.</p>",
      solution: `Console.WriteLine(Max3(4, 11, 7));

static int Max2(int a, int b) => a > b ? a : b;
static int Max3(int a, int b, int c) => Max2(a, Max2(b, c));`
    },
    {
      level: "difficile",
      title: "Mention d'une note",
      prompt: "<p>Écris <code>GetMention(int grade)</code> qui renvoie « Invalide » si la note n'est pas entre 0 et 20, « Très bien » à partir de 16, « Bien » à partir de 14, « Assez bien » à partir de 12, sinon « Passable ». Appelle-la dans une boucle <code>foreach</code> sur <code>[18, 13, 9, 25]</code>.</p>",
      hint: "<p>Commence par le cas invalide avec un <code>return</code> anticipé, puis teste du plus haut au plus bas.</p>",
      solution: `int[] grades = [18, 13, 9, 25];
foreach (int g in grades)
{
    Console.WriteLine($"{g} : {GetMention(g)}");
}

static string GetMention(int grade)
{
    if (grade < 0 || grade > 20) return "Invalide";
    if (grade >= 16) return "Très bien";
    if (grade >= 14) return "Bien";
    if (grade >= 12) return "Assez bien";
    return "Passable";
}`
    }
  ],
  quiz: [
    {
      q: "Comment s'écrit en C# la fonction TypeScript <code>function isEven(n: number): boolean</code> ?",
      options: ["<code>function IsEven(int n): bool</code>", "<code>bool IsEven(int n)</code>", "<code>IsEven(int n) bool</code>"],
      answer: 1,
      why: "En C#, le type de retour se place avant le nom et il n'y a pas de mot-clé function. Le nom passe en PascalCase."
    },
    {
      q: "Que signifie <code>void</code> devant une méthode ?",
      options: ["Elle ne renvoie aucune valeur", "Elle ne prend aucun paramètre", "Elle est vide et ne fait rien"],
      answer: 0,
      why: "void concerne uniquement la valeur de retour. Une méthode void peut prendre des paramètres et faire beaucoup de choses, comme afficher."
    },
    {
      q: "Une méthode <code>int</code> contient <code>if (x &gt; 0) return 1;</code> et rien d'autre. Que se passe-t-il ?",
      options: ["Elle renvoie 0 quand x est négatif", "Elle renvoie null quand x est négatif", "Le code ne compile pas"],
      answer: 2,
      why: "Tous les chemins d'une méthode non void doivent renvoyer une valeur. Il n'y a pas de undefined implicite comme en JavaScript : le compilateur signale l'erreur."
    }
  ],
  project: `<p>Range ton menu de Bibliothèque dans des méthodes. Écris <code>void AfficherMenu()</code> qui affiche les options, et <code>string AjouterLivre(string titre)</code> qui renvoie le titre nettoyé avec <code>Trim()</code> et affiche « Livre ajouté : X ». Ta boucle <code>do while</code> n'appelle plus que ces méthodes.</p>`,
  resources: [
    { label: "Méthodes en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/methods" },
    { label: "Fonctions locales", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/local-functions" }
  ]
});

/* ============================================================
   2.12 Méthodes : surcharge, paramètres optionnels, ref et out
   ============================================================ */
window.COURSE.push({
  key: "l-methods-advanced",
  title: "Méthodes : surcharge, paramètres optionnels, ref et out",
  summary: "Tu sauras surcharger une méthode, utiliser des paramètres optionnels, nommés et params, et comprendre le passage par valeur, ref, out et les tuples.",
  objectives: [
    "Surcharger une méthode et donner des valeurs par défaut",
    "Passer des arguments nommés et un nombre variable d'arguments (params)",
    "Comprendre la copie d'un argument et la modifier avec ref",
    "Renvoyer plusieurs valeurs avec out ou un tuple"
  ],
  analogy: `<p>Quand tu prêtes un document à un collègue, tu peux lui donner une <strong>photocopie</strong> : il peut gribouiller dessus, ton original reste intact. C'est le passage par valeur, le comportement normal de C#.</p>
<p>Tu peux aussi lui donner <strong>l'adresse du classeur</strong> où se trouve l'original : s'il le modifie, tu verras la modification. C'est <code>ref</code>.</p>`,
  lesson: `<h3>La surcharge : même nom, paramètres différents</h3>
<p>La <strong>surcharge</strong> (overloading) consiste à écrire plusieurs méthodes avec le même nom mais des paramètres différents (en nombre ou en type). Le compilateur choisit la bonne version selon les arguments que tu passes. Tu t'en sers déjà : <code>Console.WriteLine</code> existe en version <code>int</code>, <code>string</code>, <code>bool</code>…</p>
<p>TypeScript n'a pas vraiment cette notion (une seule implémentation, avec des types union). En C#, chaque version a son propre corps.</p>
<div class="tip">Les fonctions locales des top-level statements <strong>ne peuvent pas</strong> être surchargées : deux fonctions locales du même nom provoquent une erreur. Pour surcharger, on place les méthodes dans une classe <code>static</code> en bas du fichier, comme dans le premier exemple. Les classes seront expliquées au chapitre 3 ; ici, vois-la comme une simple boîte à méthodes.</div>

<h3>Paramètres optionnels et nommés</h3>
<p>Un <strong>paramètre optionnel</strong> a une valeur par défaut : <code>void Greet(string name, string greeting = "Bonjour")</code>. On peut appeler <code>Greet("Lina")</code> sans le second argument. Les paramètres optionnels se placent toujours <strong>après</strong> les obligatoires, comme en TypeScript.</p>
<p>Un <strong>argument nommé</strong> précise à quel paramètre il correspond : <code>Greet("Sam", greeting: "Salut")</code>. C'est très utile pour rendre lisible un appel plein de <code>true</code> et de nombres.</p>

<h3>params : un nombre variable d'arguments</h3>
<p><code>int Sum(params int[] numbers)</code> accepte autant d'entiers que tu veux : <code>Sum(1, 2)</code>, <code>Sum(4, 5, 6, 7)</code>, ou même <code>Sum()</code>. C# les range automatiquement dans un tableau. C'est l'équivalent du paramètre rest <code>...numbers</code> de TypeScript, et il doit être le dernier paramètre.</p>

<h3>Passage par valeur : une copie</h3>
<p>Par défaut, un argument est passé <strong>par valeur</strong> : la méthode reçoit une copie. Modifier le paramètre ne touche pas la variable de l'appelant.</p>
<pre class="diagram">Programme              Méthode AddBonus(int value)
+-------------+        +-------------+
| score = 10  | copie  | value = 10  |
+-------------+ -----&gt; +-------------+
                        value += 5
+-------------+        +-------------+
| score = 10  |        | value = 15  |  (perdue
+-------------+        +-------------+   à la fin)

Avec ref : value EST score (même case)
+---------------------------+
| score / value = 10 -&gt; 15  |
+---------------------------+</pre>

<h3>ref, out et in</h3>
<table>
<tr><th>Mot-clé</th><th>Sens</th><th>À l'appel</th></tr>
<tr><td><code>ref</code></td><td>La méthode travaille sur la variable d'origine, qui doit déjà avoir une valeur</td><td><code>AddBonus(ref score)</code></td></tr>
<tr><td><code>out</code></td><td>La méthode <strong>doit</strong> remplir la variable avant de se terminer : c'est une sortie</td><td><code>Divide(17, 5, out int rest)</code></td></tr>
<tr><td><code>in</code></td><td>Passage sans copie mais en lecture seule (utile pour de gros objets)</td><td><code>Show(in data)</code></td></tr>
</table>
<p>Tu connais déjà <code>out</code> : c'est le mécanisme de <code>int.TryParse(texte, out int nombre)</code>. La méthode renvoie un <code>bool</code> (réussi ou non) et fournit le nombre par le paramètre <code>out</code>. Le mot-clé se répète à l'appel, pour que le lecteur voie que la variable peut changer.</p>

<h3>Renvoyer plusieurs valeurs : le tuple</h3>
<p>Un <strong>tuple</strong> est un petit groupe de valeurs sans avoir à créer de type. <code>(string Name, int Age) GetMember() =&gt; ("Lina", 28);</code> renvoie deux valeurs nommées, qu'on lit avec <code>member.Name</code> et <code>member.Age</code>. On peut aussi les <strong>déconstruire</strong> (les répartir dans plusieurs variables) : <code>var (name, age) = GetMember();</code>, comme la déstructuration <code>const [name, age] = ...</code> de TypeScript.</p>
<div class="note">Dans du code moderne, on préfère un tuple (ou plus tard un <code>record</code>, chapitre 4) à plusieurs paramètres <code>out</code>. On garde <code>out</code> pour le motif <code>TryXxx</code> : un <code>bool</code> de succès, plus le résultat en <code>out</code>, qui se combine si bien avec un <code>if</code>.</div>`,
  examples: [
    {
      title: "Surcharge, paramètres optionnels et nommés, params",
      code: `Console.WriteLine(Geometry.Area(4));
Console.WriteLine(Geometry.Area(4, 3));

Greet("Lina");
Greet("Sam", greeting: "Salut");

Console.WriteLine(Sum(1, 2, 3, 4));
Console.WriteLine(Sum());

void Greet(string name, string greeting = "Bonjour") =>
    Console.WriteLine($"{greeting}, {name} !");

int Sum(params int[] numbers)
{
    int total = 0;
    foreach (int n in numbers) total += n;
    return total;
}

static class Geometry
{
    public static int Area(int side) => side * side;
    public static int Area(int width, int height) => width * height;
}`,
      output: `16
12
Bonjour, Lina !
Salut, Sam !
10
0`,
      steps: [
        "<code>Geometry.Area(4)</code> : un seul argument, le compilateur choisit la version « carré » : 4 × 4 = 16.",
        "<code>Geometry.Area(4, 3)</code> : deux arguments, c'est la version « rectangle » : 12.",
        "<code>Greet(\"Lina\")</code> : <code>greeting</code> est omis, il prend sa valeur par défaut <code>\"Bonjour\"</code>.",
        "<code>Greet(\"Sam\", greeting: \"Salut\")</code> : argument nommé, on voit tout de suite à quoi sert <code>\"Salut\"</code>.",
        "<code>int Sum(params int[] numbers)</code> : les arguments 1, 2, 3, 4 arrivent dans un tableau. Sans argument, le tableau est vide et la somme vaut 0.",
        "<code>static class Geometry { ... }</code> : la classe, déclarée après le code principal, contient les deux surcharges. <code>public</code> les rend accessibles depuis l'extérieur de la classe."
      ]
    },
    {
      title: "Copie contre ref",
      code: `int score = 10;

AddBonusCopy(score);
Console.WriteLine($"Après copie : {score}");

AddBonusRef(ref score);
Console.WriteLine($"Après ref : {score}");

static void AddBonusCopy(int value)
{
    value += 5;
}

static void AddBonusRef(ref int value)
{
    value += 5;
}`,
      output: `Après copie : 10
Après ref : 15`,
      steps: [
        "<code>AddBonusCopy(score);</code> : la méthode reçoit une copie de 10 dans <code>value</code>.",
        "<code>value += 5;</code> : seule la copie passe à 15, puis disparaît à la fin de la méthode.",
        "<code>Console.WriteLine($\"Après copie : {score}\")</code> : <code>score</code> vaut toujours 10.",
        "<code>AddBonusRef(ref score);</code> : <code>ref</code> à l'appel et dans la signature. <code>value</code> désigne la même case que <code>score</code>.",
        "<code>Console.WriteLine($\"Après ref : {score}\")</code> : cette fois, l'original a changé : 15."
      ]
    },
    {
      title: "out et tuple pour renvoyer plusieurs valeurs",
      code: `int quotient = Divide(17, 5, out int remainder);
Console.WriteLine($"17 / 5 = {quotient} reste {remainder}");

var member = GetMember();
Console.WriteLine($"{member.Name} a {member.Age} ans");

var (name, age) = GetMember();
Console.WriteLine($"{name} aura {age + 1} ans l'an prochain");

static int Divide(int a, int b, out int rest)
{
    rest = a % b;
    return a / b;
}

static (string Name, int Age) GetMember() => ("Lina", 28);`,
      output: `17 / 5 = 3 reste 2
Lina a 28 ans
Lina aura 29 ans l'an prochain`,
      steps: [
        "<code>Divide(17, 5, out int remainder)</code> : on déclare <code>remainder</code> directement dans l'appel, comme avec <code>TryParse</code>.",
        "<code>rest = a % b;</code> : la méthode est obligée de remplir son paramètre <code>out</code>. 17 % 5 = 2.",
        "<code>return a / b;</code> : division entière de deux <code>int</code> : 3.",
        "<code>static (string Name, int Age) GetMember()</code> : le type de retour est un tuple de deux valeurs nommées.",
        "<code>var (name, age) = GetMember();</code> : la déconstruction range chaque valeur du tuple dans sa propre variable."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Prix avec TVA par défaut",
      prompt: "<p>Écris <code>WithTax(double price, double rate = 20)</code> qui renvoie le prix TTC. Appelle-la avec et sans taux, puis avec l'argument nommé <code>rate: 5.5</code>.</p>",
      hint: "<p>Le prix TTC vaut <code>price + price * rate / 100</code>.</p>",
      solution: `Console.WriteLine(WithTax(100));
Console.WriteLine(WithTax(100, 10));
Console.WriteLine(WithTax(100, rate: 5.5));

static double WithTax(double price, double rate = 20) => price + price * rate / 100;`
    },
    {
      level: "moyen",
      title: "Échanger deux variables",
      prompt: "<p>Écris <code>Swap(ref int a, ref int b)</code> qui échange les valeurs de deux variables. Vérifie avec <code>x = 1</code> et <code>y = 2</code> : après l'appel, <code>x</code> vaut 2 et <code>y</code> vaut 1.</p>",
      hint: "<p>Il te faut une variable temporaire. Sans <code>ref</code>, l'échange ne se verrait pas à l'extérieur.</p>",
      solution: `int x = 1;
int y = 2;
Swap(ref x, ref y);
Console.WriteLine($"x = {x}, y = {y}");

static void Swap(ref int a, ref int b)
{
    int temp = a;
    a = b;
    b = temp;
}`
    },
    {
      level: "difficile",
      title: "Minimum et maximum d'un coup",
      prompt: "<p>Écris <code>MinMax(params int[] values)</code> qui renvoie un tuple <code>(int Min, int Max)</code>. Appelle-la avec <code>MinMax(8, 3, 12, 5)</code> et affiche « Min 3, Max 12 » en déconstruisant le résultat.</p>",
      hint: "<p>Initialise <code>min</code> et <code>max</code> avec <code>values[0]</code>, puis parcours le tableau. Renvoie <code>(min, max)</code>.</p>",
      solution: `var (min, max) = MinMax(8, 3, 12, 5);
Console.WriteLine($"Min {min}, Max {max}");

static (int Min, int Max) MinMax(params int[] values)
{
    int min = values[0];
    int max = values[0];
    foreach (int v in values)
    {
        if (v < min) min = v;
        if (v > max) max = v;
    }
    return (min, max);
}`
    }
  ],
  quiz: [
    {
      q: "Qu'est-ce qui distingue deux surcharges d'une même méthode ?",
      options: ["Leur type de retour seulement", "Leurs paramètres (nombre ou types)", "Leur nom"],
      answer: 1,
      why: "Les surcharges partagent le nom et se distinguent par leurs paramètres. Changer seulement le type de retour ne suffit pas : le compilateur ne saurait pas laquelle appeler."
    },
    {
      q: "Après <code>void Inc(int n) { n++; }</code>, <code>int a = 1; Inc(a);</code>, que vaut <code>a</code> ?",
      options: ["1", "2", "Erreur de compilation"],
      answer: 0,
      why: "a est passé par valeur : Inc incrémente une copie. Pour modifier a, il faudrait <code>ref int n</code> et l'appel <code>Inc(ref a)</code>."
    },
    {
      q: "Quelle est la règle propre à un paramètre <code>out</code> ?",
      options: ["Il doit avoir une valeur avant l'appel", "Il est en lecture seule dans la méthode", "La méthode doit lui donner une valeur avant de se terminer"],
      answer: 2,
      why: "out est une sortie : la méthode est obligée de l'affecter. C'est ref qui exige une valeur avant l'appel, et in qui est en lecture seule."
    },
    {
      q: "Comment appeler <code>void Log(string msg, bool urgent = false, int level = 1)</code> en changeant seulement <code>level</code> ?",
      options: ["<code>Log(\"Oups\", 3)</code>", "<code>Log(\"Oups\", level: 3)</code>", "<code>Log(\"Oups\", , 3)</code>"],
      answer: 1,
      why: "L'argument nommé saute urgent, qui garde sa valeur par défaut. <code>Log(\"Oups\", 3)</code> tenterait de mettre 3 dans le bool urgent, et la virgule vide n'existe pas en C#."
    }
  ],
  resources: [
    { label: "Arguments nommés et facultatifs", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/named-and-optional-arguments" },
    { label: "Paramètres de méthode (ref, out, in, params)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/method-parameters" }
  ]
});

/* ============================================================
   2.13 Chaînes en détail
   ============================================================ */
window.COURSE.push({
  key: "l-strings",
  title: "Chaînes en détail",
  summary: "Tu sauras manipuler, comparer, formater et construire des chaînes efficacement, y compris du JSON avec les raw string literals.",
  objectives: [
    "Utiliser les méthodes courantes de string (Trim, Split, Replace…)",
    "Comprendre l'immutabilité et utiliser StringBuilder dans une boucle",
    "Comparer sans tenir compte de la casse avec StringComparison",
    "Formater des nombres et écrire du JSON avec \"\"\""
  ],
  analogy: `<p>Une <code>string</code> en C#, c'est un texte gravé dans la pierre. Tu ne peux pas effacer une lettre : pour « corriger », tu graves une nouvelle pierre et tu jettes l'ancienne. Graver une pierre de temps en temps, aucun souci.</p>
<p>Mais si tu ajoutes un mot à chaque tour d'une boucle de 10 000 tours, tu graves 10 000 pierres. <code>StringBuilder</code>, c'est un tableau blanc : tu écris, tu complètes, et tu ne graves la pierre finale qu'une seule fois.</p>`,
  lesson: `<h3>Les méthodes courantes</h3>
<p>Tu connais les bases des chaînes (2.2). Voici la boîte à outils du quotidien. Toutes s'appellent sur une chaîne avec un point, comme en TypeScript, mais en PascalCase :</p>
<table>
<tr><th>Méthode</th><th>Rôle</th><th>Équivalent TS</th></tr>
<tr><td><code>ToUpper()</code> / <code>ToLower()</code></td><td>Majuscules / minuscules</td><td><code>toUpperCase()</code></td></tr>
<tr><td><code>Trim()</code></td><td>Enlève les espaces au début et à la fin</td><td><code>trim()</code></td></tr>
<tr><td><code>Contains("x")</code>, <code>StartsWith("x")</code></td><td>Contient / commence par</td><td><code>includes()</code>, <code>startsWith()</code></td></tr>
<tr><td><code>IndexOf("x")</code></td><td>Position de la première occurrence, -1 si absente</td><td><code>indexOf()</code></td></tr>
<tr><td><code>Substring(début, longueur)</code></td><td>Extrait un morceau</td><td><code>substr()</code></td></tr>
<tr><td><code>Replace("a", "b")</code></td><td>Remplace <strong>toutes</strong> les occurrences</td><td><code>replaceAll()</code></td></tr>
<tr><td><code>Split(';')</code> / <code>string.Join(", ", t)</code></td><td>Découpe en tableau / colle un tableau</td><td><code>split()</code> / <code>join()</code></td></tr>
<tr><td><code>PadLeft(3, '0')</code></td><td>Complète à gauche jusqu'à une longueur</td><td><code>padStart()</code></td></tr>
</table>
<p>Attention : <code>Substring</code> prend une <strong>longueur</strong> en second argument, pas un index de fin. Et <code>Replace</code> remplace toutes les occurrences, contrairement au <code>replace</code> de JavaScript.</p>

<h3>Immutabilité et StringBuilder</h3>
<p>Une chaîne est <strong>immuable</strong> : une fois créée, elle ne change plus jamais. <code>title.ToUpper()</code> ne modifie pas <code>title</code>, elle renvoie une <strong>nouvelle</strong> chaîne. Il faut récupérer le résultat : <code>title = title.Trim();</code>.</p>
<div class="flow"><span>"Bonjour"</span><span>+ " Lina"</span><span>Nouvelle chaîne créée</span><span>Ancienne jetée</span></div>
<p>Dans une boucle, <code>text += ...</code> recrée donc une chaîne complète à chaque tour. Pour construire un texte morceau par morceau, on utilise <code>StringBuilder</code> (dans <code>System.Text</code>) : <code>Append</code> ajoute sans recopier, et <code>ToString()</code> produit la chaîne finale.</p>

<h3>Comparer correctement</h3>
<p><code>==</code> compare les chaînes caractère par caractère, en respectant la casse : <code>"DUNE" == "dune"</code> vaut <code>false</code>. Pour ignorer majuscules et minuscules, n'écris pas <code>a.ToLower() == b.ToLower()</code> (deux chaînes créées pour rien) mais :</p>
<p><code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code></p>
<p><code>Ordinal</code> signifie « compare les codes des caractères », sans règles de langue : c'est rapide et prévisible. La plupart des méthodes acceptent ce paramètre : <code>Contains("dune", StringComparison.OrdinalIgnoreCase)</code>, <code>StartsWith</code>, <code>IndexOf</code>…</p>
<div class="tip">Pour vérifier qu'une saisie est vide, utilise <code>string.IsNullOrWhiteSpace(input)</code> : il renvoie <code>true</code> pour <code>null</code>, <code>""</code> et <code>"   "</code>. C'est le test idéal après un <code>Console.ReadLine()</code>.</div>

<h3>Formater des nombres</h3>
<p>Dans une interpolation, on ajoute un format après deux-points : <code>{price:N2}</code> (séparateur de milliers et 2 décimales), <code>{price:C}</code> (monnaie), <code>{id:D3}</code> (entier sur 3 chiffres, <code>7</code> devient <code>007</code>). Le résultat dépend de la <strong>culture</strong> (les règles d'un pays) : en France, <code>1 234,50</code> ; aux États-Unis, <code>1,234.50</code>. Pour un résultat stable, précise la culture : <code>price.ToString("C", new CultureInfo("en-US"))</code> ou <code>string.Create(CultureInfo.InvariantCulture, $"{price:N2}")</code>.</p>

<h3>Raw string literals pour le JSON</h3>
<p>Écrire du JSON dans une chaîne classique oblige à échapper chaque guillemet. Une <strong>raw string literal</strong> commence et finit par trois guillemets <code>"""</code> : tout ce qui est entre les deux est pris tel quel, guillemets compris, sur plusieurs lignes. L'indentation de la ligne <code>"""</code> finale est retirée de chaque ligne. Pour y insérer des variables, on met <code>$$</code> devant : les accolades simples restent du JSON, et <code>{{variable}}</code> est remplacé.</p>
<div class="note">En production, on ne construit pas du JSON à la main : on sérialise des objets avec <code>System.Text.Json</code> (chapitre 6), qui gère les échappements. Les raw strings servent surtout pour les tests, les exemples et les requêtes SQL lisibles.</div>`,
  examples: [
    {
      title: "La boîte à outils des chaînes",
      code: `string raw = "  Le Petit Prince  ";
string title = raw.Trim();

Console.WriteLine($"[{title}]");
Console.WriteLine(title.ToUpper());
Console.WriteLine(title.Contains("Petit"));
Console.WriteLine(title.StartsWith("Le"));
Console.WriteLine(title.IndexOf("Prince"));
Console.WriteLine(title.Substring(3, 5));
Console.WriteLine(title.Replace("Petit", "Grand"));
Console.WriteLine($"[{raw}]");`,
      output: `[Le Petit Prince]
LE PETIT PRINCE
True
True
9
Petit
Le Grand Prince
[  Le Petit Prince  ]`,
      steps: [
        "<code>string title = raw.Trim();</code> : on récupère une nouvelle chaîne sans les espaces autour.",
        "<code>title.ToUpper()</code> : renvoie une version en majuscules, sans modifier <code>title</code>.",
        "<code>title.IndexOf(\"Prince\")</code> : « Le » (0-1), espace (2), « Petit » (3-7), espace (8) : « Prince » commence à l'index 9.",
        "<code>title.Substring(3, 5)</code> : 5 caractères à partir de l'index 3, soit « Petit ».",
        "<code>title.Replace(\"Petit\", \"Grand\")</code> : une nouvelle chaîne avec le remplacement.",
        "<code>Console.WriteLine($\"[{raw}]\")</code> : la preuve de l'immutabilité, <code>raw</code> a gardé ses espaces."
      ]
    },
    {
      title: "Découper, coller, compléter, construire",
      code: `using System.Text;

string csv = "Dune;Akira;Matilda";
string[] parts = csv.Split(';');
Console.WriteLine(parts.Length);
Console.WriteLine(string.Join(" | ", parts));

for (int id = 1; id <= 3; id++)
{
    Console.WriteLine($"LIV-{id.ToString().PadLeft(3, '0')}");
}

var builder = new StringBuilder();
foreach (string part in parts)
{
    builder.Append(part[0]);
}
Console.WriteLine(builder.ToString());`,
      output: `3
Dune | Akira | Matilda
LIV-001
LIV-002
LIV-003
DAM`,
      steps: [
        "<code>using System.Text;</code> : donne accès à <code>StringBuilder</code>. Les <code>using</code> se placent tout en haut du fichier.",
        "<code>csv.Split(';')</code> : découpe à chaque point-virgule et renvoie un tableau de 3 chaînes.",
        "<code>string.Join(\" | \", parts)</code> : l'inverse, on colle les éléments avec un séparateur.",
        "<code>id.ToString().PadLeft(3, '0')</code> : complète à gauche avec des zéros jusqu'à 3 caractères.",
        "<code>builder.Append(part[0]);</code> : on ajoute la première lettre de chaque titre, sans créer de chaîne intermédiaire.",
        "<code>builder.ToString()</code> : produit la chaîne finale, une seule fois."
      ]
    },
    {
      title: "Comparer, formater et écrire du JSON",
      code: `using System.Globalization;

string input = "DUNE";
Console.WriteLine(input == "dune");
Console.WriteLine(string.Equals(input, "dune", StringComparison.OrdinalIgnoreCase));
Console.WriteLine(string.IsNullOrWhiteSpace("   "));

double price = 1234.5;
Console.WriteLine(string.Create(CultureInfo.InvariantCulture, $"{price:N2}"));
Console.WriteLine(price.ToString("C", new CultureInfo("en-US")));
Console.WriteLine($"{42:D3}");

string title = "Dune";
string json = $$"""
    {
      "title": "{{title}}",
      "year": 1965
    }
    """;
Console.WriteLine(json);`,
      output: `False
True
True
1,234.50
$1,234.50
042
{
  "title": "Dune",
  "year": 1965
}`,
      steps: [
        "<code>input == \"dune\"</code> : <code>==</code> respecte la casse, donc <code>False</code>.",
        "<code>StringComparison.OrdinalIgnoreCase</code> : on ignore la casse, donc <code>True</code>.",
        "<code>string.IsNullOrWhiteSpace(\"   \")</code> : une chaîne faite uniquement d'espaces compte comme vide.",
        "<code>string.Create(CultureInfo.InvariantCulture, $\"{price:N2}\")</code> : format N2 avec la culture invariante, donc le même résultat sur toutes les machines.",
        "<code>price.ToString(\"C\", new CultureInfo(\"en-US\"))</code> : format monnaie avec la culture américaine, d'où le <code>$</code>.",
        "<code>$\"{42:D3}\"</code> : un entier sur 3 chiffres minimum. Le format D ne dépend pas de la culture.",
        "<code>$$\"\"\" ... \"\"\"</code> : raw string interpolée. Les guillemets du JSON passent tels quels, <code>{{title}}</code> est remplacé par <code>Dune</code> et l'indentation du <code>\"\"\"</code> final est retirée."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Nettoyer une saisie",
      prompt: "<p>À partir de <code>\"   victor HUGO \"</code>, affiche le texte sans espaces autour et en majuscules, puis le nombre de caractères du texte nettoyé.</p>",
      hint: "<p>Les méthodes s'enchaînent : <code>raw.Trim().ToUpper()</code>.</p>",
      solution: `string raw = "   victor HUGO ";
string clean = raw.Trim().ToUpper();
Console.WriteLine(clean);
Console.WriteLine(clean.Length);`
    },
    {
      level: "moyen",
      title: "Initiales",
      prompt: "<p>Écris une méthode <code>Initials(string fullName)</code> qui renvoie les initiales en majuscules séparées par des points : <code>\"jules gabriel verne\"</code> donne <code>\"J.G.V.\"</code>. Utilise <code>Split</code> et un <code>StringBuilder</code>.</p>",
      hint: "<p>Pour chaque mot, prends <code>word[0]</code> et passe-le en majuscule avec <code>char.ToUpper(...)</code>. Pense à <code>StringSplitOptions.RemoveEmptyEntries</code> si plusieurs espaces se suivent.</p>",
      solution: `using System.Text;

Console.WriteLine(Initials("jules gabriel verne"));

static string Initials(string fullName)
{
    var builder = new StringBuilder();
    string[] words = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    foreach (string word in words)
    {
        builder.Append(char.ToUpper(word[0])).Append('.');
    }
    return builder.ToString();
}`
    },
    {
      level: "difficile",
      title: "Ticket de caisse aligné",
      prompt: "<p>Avec les tableaux <code>[\"Dune\", \"Akira\"]</code> et <code>[9.9, 12.5]</code>, affiche un ticket où chaque prix a 2 décimales (culture invariante) et est aligné à droite sur 8 caractères, puis une ligne TOTAL. Construis tout le ticket avec un <code>StringBuilder</code> et affiche-le en une fois.</p>",
      hint: "<p><code>price.ToString(\"N2\", CultureInfo.InvariantCulture).PadLeft(8)</code> donne un prix aligné. <code>AppendLine</code> ajoute un texte suivi d'un retour à la ligne.</p>",
      solution: `using System.Globalization;
using System.Text;

string[] titles = ["Dune", "Akira"];
double[] prices = [9.9, 12.5];
var ticket = new StringBuilder();
double total = 0;
for (int i = 0; i < titles.Length; i++)
{
    total += prices[i];
    ticket.AppendLine(titles[i].PadRight(10) + prices[i].ToString("N2", CultureInfo.InvariantCulture).PadLeft(8));
}
ticket.AppendLine("TOTAL".PadRight(10) + total.ToString("N2", CultureInfo.InvariantCulture).PadLeft(8));
Console.Write(ticket.ToString());`
    }
  ],
  quiz: [
    {
      q: "Après <code>string s = \"abc\"; s.ToUpper();</code>, que vaut <code>s</code> ?",
      options: ["\"ABC\"", "\"abc\"", "null"],
      answer: 1,
      why: "Les chaînes sont immuables : ToUpper renvoie une nouvelle chaîne, ignorée ici. Il fallait écrire <code>s = s.ToUpper();</code>."
    },
    {
      q: "Quelle est la meilleure façon de tester que deux titres sont égaux sans tenir compte de la casse ?",
      options: ["<code>a.ToLower() == b.ToLower()</code>", "<code>a == b</code>", "<code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code>"],
      answer: 2,
      why: "string.Equals avec OrdinalIgnoreCase compare directement sans créer de chaînes temporaires. ToLower fonctionne mais crée deux chaînes et peut surprendre selon la langue ; == respecte la casse."
    },
    {
      q: "Que vaut <code>\"Bibliothèque\".Substring(0, 5)</code> ?",
      options: ["\"Bibli\"", "\"Bibl\"", "\"Biblio\""],
      answer: 0,
      why: "Le second argument est une longueur : 5 caractères à partir de l'index 0. Ce n'est pas un index de fin comme dans slice."
    },
    {
      q: "Pourquoi utiliser <code>StringBuilder</code> pour construire un texte dans une boucle de 10 000 tours ?",
      options: ["Parce que += est interdit dans une boucle", "Parce que chaque += recrée une chaîne complète, ce qui est lent", "Parce que StringBuilder ignore la casse"],
      answer: 1,
      why: "Une string étant immuable, chaque += copie tout le texte dans une nouvelle chaîne. StringBuilder ajoute sans recopier. += reste autorisé, juste inefficace en masse."
    }
  ],
  project: `<p>Ajoute la recherche à ta Bibliothèque : écris <code>bool ContientLivre(string[] livres, string recherche)</code> qui parcourt le tableau et renvoie <code>true</code> si un titre contient le texte cherché, sans tenir compte de la casse (<code>Contains(recherche, StringComparison.OrdinalIgnoreCase)</code>). Ignore les cases <code>null</code>, et refuse une recherche vide avec <code>string.IsNullOrWhiteSpace</code>. Ainsi « dune » trouve « Dune ».</p>`,
  resources: [
    { label: "Comparer des chaînes en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/how-to/compare-strings" },
    { label: "Raw string literals", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/tokens/raw-string" }
  ]
});

/* ============================================================
   2.14 Dates et heures
   ============================================================ */
window.COURSE.push({
  key: "l-dates",
  title: "Dates et heures",
  summary: "Tu sauras créer, calculer, formater et lire des dates et des durées, et éviter les pièges des fuseaux horaires.",
  objectives: [
    "Choisir entre DateTime, DateOnly, TimeOnly et DateTimeOffset",
    "Calculer des durées avec TimeSpan et AddDays",
    "Formater et lire une date avec un format précis et InvariantCulture",
    "Comprendre pourquoi on stocke les dates en UTC"
  ],
  analogy: `<p>Une date sans fuseau horaire, c'est comme dire « rendez-vous à 9 h » à quelqu'un qui habite à Montréal alors que toi tu es à Paris : vous ne serez pas là au même moment. Pour être sûr, il faut dire « 9 h, heure de Paris », ou mieux, donner l'heure dans une référence commune.</p>
<p>Cette référence mondiale s'appelle <strong>UTC</strong>. C'est l'horloge que tout le monde partage ; chacun convertit ensuite à son heure locale pour l'afficher.</p>`,
  lesson: `<h3>Les types de date</h3>
<p>En JavaScript, tout passe par un seul objet <code>Date</code>. .NET propose plusieurs types, chacun avec un rôle précis :</p>
<table>
<tr><th>Type</th><th>Contient</th><th>Exemple d'usage</th></tr>
<tr><td><code>DateTime</code></td><td>Une date et une heure</td><td>L'heure d'un emprunt</td></tr>
<tr><td><code>DateOnly</code></td><td>Une date seule</td><td>Un anniversaire, une date de retour</td></tr>
<tr><td><code>TimeOnly</code></td><td>Une heure seule</td><td>L'heure d'ouverture : 09:00</td></tr>
<tr><td><code>TimeSpan</code></td><td>Une durée</td><td>14 jours, 2 h 30</td></tr>
<tr><td><code>DateTimeOffset</code></td><td>Une date, une heure et un décalage avec UTC</td><td>Un horodatage fiable en base</td></tr>
</table>
<p>Pour l'instant présent : <code>DateTime.Now</code> (heure locale de la machine), <code>DateTime.UtcNow</code> (heure UTC) et <code>DateTime.Today</code> (aujourd'hui à minuit). Pour une date précise : <code>new DateTime(2026, 3, 15)</code>. Bonne nouvelle : contrairement à JavaScript, les mois commencent à <strong>1</strong>, mars vaut bien 3.</p>

<h3>Calculer avec des durées</h3>
<p>Les dates sont immuables, comme les chaînes : <code>date.AddDays(14)</code> renvoie une <strong>nouvelle</strong> date. Il existe aussi <code>AddHours</code>, <code>AddMonths</code>, <code>AddYears</code>, et un nombre négatif recule dans le temps.</p>
<p>Soustraire deux <code>DateTime</code> donne un <code>TimeSpan</code>, une durée. On lit ses morceaux avec <code>Days</code>, <code>Hours</code>, <code>Minutes</code>, ou sa valeur totale avec <code>TotalDays</code>, <code>TotalHours</code>. Pour deux <code>DateOnly</code>, on soustrait leurs <code>DayNumber</code> (le numéro du jour depuis l'an 1) pour obtenir un nombre de jours.</p>
<div class="flow"><span>Date d'emprunt</span><span>+ 14 jours</span><span>Date de retour prévue</span><span>Retour réel - prévue = retard</span></div>

<h3>Formater une date</h3>
<p><code>ToString</code> accepte un format fait de lettres : <code>yyyy</code> (année), <code>MM</code> (mois), <code>dd</code> (jour), <code>HH</code> (heure sur 24 h), <code>mm</code> (minutes). Attention à la casse : <code>MM</code> est le mois, <code>mm</code> les minutes. Sans culture précisée, le résultat dépend de la machine (noms de mois, séparateurs). Ajoute <code>CultureInfo.InvariantCulture</code> pour un résultat stable : <code>date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)</code>.</p>

<h3>Lire une date tapée par l'utilisateur</h3>
<p>Comme <code>int.TryParse</code>, <code>DateTime.TryParseExact</code> tente de convertir un texte et renvoie <code>false</code> au lieu de planter. Tu lui donnes le texte, le format attendu, la culture, des options (<code>DateTimeStyles.None</code>) et la variable <code>out</code> qui recevra la date. « 2026-02-30 » sera refusé : le 30 février n'existe pas.</p>

<h3>UTC et fuseaux horaires</h3>
<p>Un serveur en Irlande et un utilisateur à Paris n'ont pas la même heure locale, et l'heure d'été décale tout d'une heure deux fois par an. Si tu stockes <code>DateTime.Now</code>, tu ne sais plus ensuite à quel fuseau correspondait cette heure.</p>
<pre class="diagram">Paris (UTC+2 en été)    10:00 +02:00
                             |
                             v   on retire 2 h
UTC (référence commune)  08:00 +00:00
                             |
                             v   on retire 4 h
Montréal (UTC-4 en été)  04:00 -04:00

Même instant, trois affichages différents.</pre>
<p>La règle : <strong>stocke en UTC</strong> (<code>DateTime.UtcNow</code> ou <code>DateTimeOffset.UtcNow</code>), et convertis en heure locale uniquement pour l'affichage. <code>DateTimeOffset</code> garde en plus le décalage d'origine, ce qui le rend plus sûr que <code>DateTime</code>.</p>
<div class="tip">Ne compare jamais une date issue de <code>DateTime.Now</code> avec une autre issue de <code>DateTime.UtcNow</code> : l'écart vaut le décalage horaire (une ou deux heures en France). Choisis UTC partout dans ton code.</div>
<div class="note">Dans un vrai projet, on n'appelle pas <code>DateTime.UtcNow</code> partout : on injecte un <code>TimeProvider</code> (inclus dans .NET). En test, on le remplace par une horloge fixe, et les calculs de retard deviennent vérifiables à coup sûr.</div>`,
  examples: [
    {
      title: "Créer, avancer et formater une date",
      code: `using System.Globalization;

var start = new DateTime(2026, 3, 15, 14, 30, 0);
Console.WriteLine(start.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture));

DateTime later = start.AddDays(20);
Console.WriteLine(later.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture));
Console.WriteLine(later.DayOfWeek);

var birthday = new DateOnly(2026, 12, 25);
var opening = new TimeOnly(9, 0);
Console.WriteLine(birthday.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
Console.WriteLine(opening.ToString("HH:mm", CultureInfo.InvariantCulture));`,
      output: `2026-03-15 14:30
04/04/2026
Saturday
2026-12-25
09:00`,
      steps: [
        "<code>new DateTime(2026, 3, 15, 14, 30, 0)</code> : année, mois (3 = mars), jour, heure, minute, seconde. Une date fixe, pour un résultat toujours identique.",
        "<code>ToString(\"yyyy-MM-dd HH:mm\", CultureInfo.InvariantCulture)</code> : un format précis, indépendant de la machine.",
        "<code>start.AddDays(20)</code> : 15 mars + 20 jours = 4 avril. <code>start</code> n'est pas modifiée.",
        "<code>later.DayOfWeek</code> : le jour de la semaine, affiché en anglais car c'est le nom de la valeur.",
        "<code>new DateOnly(2026, 12, 25)</code> et <code>new TimeOnly(9, 0)</code> : une date sans heure et une heure sans date."
      ]
    },
    {
      title: "Des durées avec TimeSpan",
      code: `var start = new DateTime(2026, 3, 1, 9, 0, 0);
var end = new DateTime(2026, 3, 3, 17, 30, 0);

TimeSpan duration = end - start;
Console.WriteLine($"{duration.Days} j {duration.Hours} h {duration.Minutes} min");
Console.WriteLine(duration.TotalMinutes);

TimeSpan loan = TimeSpan.FromDays(14);
Console.WriteLine(loan.TotalHours);

var pause = TimeSpan.FromMinutes(90);
Console.WriteLine(pause);`,
      output: `2 j 8 h 30 min
3390
336
01:30:00`,
      steps: [
        "<code>end - start</code> : soustraire deux dates donne un <code>TimeSpan</code>, ici 2 jours, 8 heures et 30 minutes.",
        "<code>duration.Days</code>, <code>Hours</code>, <code>Minutes</code> : les morceaux de la durée, chacun séparément.",
        "<code>duration.TotalMinutes</code> : la durée entière exprimée en minutes : 2 × 1440 + 8 × 60 + 30 = 3390.",
        "<code>TimeSpan.FromDays(14)</code> : une durée de 14 jours, soit 336 heures.",
        "<code>Console.WriteLine(pause)</code> : un <code>TimeSpan</code> s'affiche par défaut au format <code>hh:mm:ss</code>."
      ]
    },
    {
      title: "Lire une date et travailler en UTC",
      code: `using System.Globalization;

string[] inputs = ["2026-07-14", "2026-02-30"];
foreach (string input in inputs)
{
    if (DateTime.TryParseExact(input, "yyyy-MM-dd", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out DateTime date))
    {
        Console.WriteLine($"{input} : valide, {date.ToString("dd MMM yyyy", CultureInfo.InvariantCulture)}");
    }
    else
    {
        Console.WriteLine($"{input} : date invalide");
    }
}

var meeting = new DateTimeOffset(2026, 7, 14, 10, 0, 0, TimeSpan.FromHours(2));
Console.WriteLine(meeting.ToString("yyyy-MM-dd HH:mm zzz", CultureInfo.InvariantCulture));
Console.WriteLine(meeting.UtcDateTime.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture));`,
      output: `2026-07-14 : valide, 14 Jul 2026
2026-02-30 : date invalide
2026-07-14 10:00 +02:00
2026-07-14 08:00`,
      steps: [
        "<code>DateTime.TryParseExact(input, \"yyyy-MM-dd\", ...)</code> : le texte doit respecter exactement ce format.",
        "<code>out DateTime date</code> : en cas de succès, la date lue arrive ici, comme avec <code>int.TryParse</code>.",
        "<code>\"2026-02-30\"</code> : le format est bon, mais le 30 février n'existe pas, donc <code>false</code> sans planter.",
        "<code>new DateTimeOffset(..., TimeSpan.FromHours(2))</code> : 10 h à Paris en été, avec son décalage +02:00.",
        "<code>zzz</code> : affiche le décalage avec UTC.",
        "<code>meeting.UtcDateTime</code> : le même instant en UTC, 2 heures plus tôt : 08:00."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Dans 100 jours",
      prompt: "<p>À partir de la date fixe du 1er janvier 2026, affiche la date 100 jours plus tard au format <code>yyyy-MM-dd</code>, ainsi que son jour de la semaine.</p>",
      hint: "<p><code>new DateTime(2026, 1, 1).AddDays(100)</code>, puis <code>ToString</code> avec <code>CultureInfo.InvariantCulture</code>.</p>",
      solution: `using System.Globalization;

var start = new DateTime(2026, 1, 1);
DateTime target = start.AddDays(100);
Console.WriteLine(target.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
Console.WriteLine(target.DayOfWeek);`
    },
    {
      level: "moyen",
      title: "Quel âge as-tu ?",
      prompt: "<p>Demande une date de naissance au format <code>dd/MM/yyyy</code>. Si la saisie est invalide, affiche un message. Sinon, calcule l'âge en années au 6 novembre 2026 (date fixe), en tenant compte de l'anniversaire pas encore passé.</p>",
      hint: "<p>Utilise <code>DateOnly.TryParseExact</code>. L'âge, c'est la différence des années, moins 1 si la date d'anniversaire de cette année est après aujourd'hui (<code>birth.AddYears(age) &gt; today</code>).</p>",
      solution: `using System.Globalization;

var today = new DateOnly(2026, 11, 6);
Console.Write("Date de naissance (dd/MM/yyyy) : ");
string? input = Console.ReadLine();
if (!DateOnly.TryParseExact(input, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly birth))
{
    Console.WriteLine("Date invalide");
    return;
}
int age = today.Year - birth.Year;
if (birth.AddYears(age) > today) age--;
Console.WriteLine($"Tu as {age} ans");`
    },
    {
      level: "difficile",
      title: "Horodatage UTC d'un événement",
      prompt: "<p>Une réunion a lieu le 20 janvier 2026 à 15 h à Paris (en hiver, UTC+1). Crée-la avec <code>DateTimeOffset</code>, affiche son heure UTC, puis l'heure correspondante à Montréal (UTC-5 en hiver) avec <code>ToOffset</code>. Affiche enfin combien d'heures séparent cette réunion du 1er janvier 2026 à minuit UTC.</p>",
      hint: "<p><code>meeting.ToOffset(TimeSpan.FromHours(-5))</code> change l'affichage sans changer l'instant. Soustraire deux <code>DateTimeOffset</code> donne un <code>TimeSpan</code> correct même avec des décalages différents.</p>",
      solution: `using System.Globalization;

var meeting = new DateTimeOffset(2026, 1, 20, 15, 0, 0, TimeSpan.FromHours(1));
var montreal = meeting.ToOffset(TimeSpan.FromHours(-5));
var newYear = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

Console.WriteLine(meeting.UtcDateTime.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture));
Console.WriteLine(montreal.ToString("yyyy-MM-dd HH:mm zzz", CultureInfo.InvariantCulture));
Console.WriteLine((meeting - newYear).TotalHours);`
    }
  ],
  quiz: [
    {
      q: "Que vaut le mois de <code>new DateTime(2026, 1, 15)</code> ?",
      options: ["Février, car les mois commencent à 0", "Janvier", "Une erreur, le mois 1 n'existe pas"],
      answer: 1,
      why: "En .NET, les mois vont de 1 à 12 : 1 est janvier. Le piège vient de JavaScript, où <code>new Date(2026, 1, 15)</code> est en février."
    },
    {
      q: "Quel type obtiens-tu avec <code>date2 - date1</code> sur deux <code>DateTime</code> ?",
      options: ["Un TimeSpan", "Un int de jours", "Un DateTime"],
      answer: 0,
      why: "La différence de deux dates est une durée, un TimeSpan. On en tire ensuite Days ou TotalDays selon le besoin."
    },
    {
      q: "Dans le format <code>\"yyyy-MM-dd HH:mm\"</code>, que représente <code>mm</code> ?",
      options: ["Le mois", "Les millisecondes", "Les minutes"],
      answer: 2,
      why: "MM (majuscules) est le mois et mm (minuscules) les minutes. Inverser les deux est une erreur classique qui donne des dates absurdes sans aucun message d'erreur."
    },
    {
      q: "Pourquoi stocker les dates en UTC ?",
      options: ["Parce que c'est plus court à écrire", "Parce que c'est une référence commune, indépendante du fuseau et de l'heure d'été", "Parce que DateTime.Now n'existe plus en .NET 10"],
      answer: 1,
      why: "UTC est la même partout et ne change jamais d'heure. L'heure locale dépend de la machine et de l'heure d'été, ce qui rend les comparaisons fausses. DateTime.Now existe toujours, il sert à l'affichage."
    }
  ],
  project: `<p>Ajoute les emprunts à ta Bibliothèque. Avec une date d'emprunt fixe <code>new DateOnly(2026, 3, 1)</code>, calcule la date de retour prévue (14 jours plus tard) et affiche-la au format <code>dd/MM/yyyy</code>. Puis, pour un retour réel le <code>new DateOnly(2026, 3, 20)</code>, calcule les jours de retard avec <code>retour.DayNumber - prevue.DayNumber</code> et affiche « 5 jours de retard », ou « Rendu à temps » si le résultat est négatif ou nul.</p>`,
  resources: [
    { label: "Utiliser DateOnly et TimeOnly", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/datetime/how-to-use-dateonly-timeonly" },
    { label: "Choisir entre DateTime, DateTimeOffset et TimeZoneInfo", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/datetime/choosing-between-datetime" }
  ]
});
