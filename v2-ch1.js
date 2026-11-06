window.COURSE = window.COURSE || [];

// ───────────────────────── 1.1 Qu'est-ce que .NET ? ─────────────────────────
window.COURSE.push({
  key: "l-dotnet-intro",
  title: "Qu'est-ce que .NET ?",
  summary: "Tu sauras expliquer ce qu'est .NET, ce qu'on construit avec, et comment il se compare à l'écosystème Node.js/TypeScript que tu connais.",
  objectives: [
    "Distinguer .NET (la plateforme) de C# (le langage)",
    "Citer les grandes briques : runtime, bibliothèques, outils",
    "Comprendre les versions : .NET Framework, .NET Core, .NET 5+, LTS et STS",
    "Faire le lien avec Node.js, npm et TypeScript"
  ],
  analogy: `<p>Pense à une cuisine professionnelle. Le <strong>langage C#</strong>, c'est la recette que tu écris. Mais une recette seule ne sert à rien : il faut des fourneaux (le <strong>runtime</strong>), des ingrédients déjà préparés (les <strong>bibliothèques</strong>) et des ustensiles (les <strong>outils</strong>). .NET, c'est toute la cuisine équipée. Tu apportes la recette, .NET fournit le reste.</p>`,
  lesson: `
<h3>Une plateforme, pas juste un langage</h3>
<p>Quand on dit « je fais du .NET », on parle d'une <strong>plateforme</strong> : un ensemble d'outils qui permet d'écrire, de compiler et d'exécuter des programmes. C# est le langage le plus utilisé sur cette plateforme, mais ce n'est pas le seul. Il existe aussi F# (orienté fonctionnel) et Visual Basic (plus ancien).</p>
<p>La plateforme a trois grandes briques :</p>
<table>
  <tr><th>Brique</th><th>Rôle</th><th>Équivalent côté JS</th></tr>
  <tr><td>Le runtime (CLR)</td><td>Exécute ton programme, gère la mémoire</td><td>Node.js / le moteur V8</td></tr>
  <tr><td>Les bibliothèques de base (BCL)</td><td>Fichiers, texte, dates, réseau, JSON…</td><td>Les modules intégrés de Node (<code>fs</code>, <code>path</code>…)</td></tr>
  <tr><td>Les outils (SDK, CLI <code>dotnet</code>)</td><td>Créer, compiler, lancer, tester</td><td><code>node</code>, <code>npm</code>, <code>tsc</code></td></tr>
</table>
<p>Un <strong>runtime</strong>, c'est le programme qui fait tourner ton code. Une <strong>bibliothèque</strong>, c'est du code déjà écrit que tu peux réutiliser. Tu retrouveras ces deux mots partout.</p>

<h3>Ce qu'on construit avec .NET</h3>
<p>.NET est très polyvalent. Avec le même langage, tu peux viser presque toutes les cibles :</p>
<ul>
  <li><strong>APIs web</strong> et sites avec ASP.NET Core (c'est souvent là qu'on retrouve un dev Angular : le back de son front).</li>
  <li><strong>Applications desktop</strong> Windows (WPF, WinForms) ou multiplateformes.</li>
  <li><strong>Applications mobiles</strong> avec .NET MAUI.</li>
  <li><strong>Services cloud</strong>, tâches de fond, Azure Functions.</li>
  <li><strong>Jeux vidéo</strong> : le moteur Unity utilise C#.</li>
  <li><strong>Outils en ligne de commande</strong>, comme ceux que tu vas écrire dans ce cours.</li>
</ul>

<h3>Une histoire en trois étapes</h3>
<div class="flow"><span>.NET Framework (2002, Windows)</span><span>.NET Core (2016, multiplateforme)</span><span>.NET 5+ (2020, unifié)</span></div>
<p>Au départ, le <strong>.NET Framework</strong> ne tournait que sous Windows. En 2016, Microsoft a réécrit la plateforme en open source et multiplateforme : <strong>.NET Core</strong>, qui fonctionne sous Windows, Linux et macOS. Depuis .NET 5, il n'y a plus qu'un seul nom : « .NET », suivi d'un numéro.</p>
<p>Si tu croises « .NET Framework 4.8 » dans une vieille application d'entreprise, c'est l'ancienne branche, encore maintenue mais figée. Pour un nouveau projet, on prend toujours le .NET moderne.</p>

<h3>LTS ou STS : quelle version choisir ?</h3>
<p>Une nouvelle version de .NET sort chaque mois de novembre. Elles n'ont pas toutes la même durée de support :</p>
<div class="compare">
  <div><h4>LTS (Long Term Support)</h4><p>Versions paires (8, 10…). Supportées 3 ans. Le choix par défaut en entreprise.</p></div>
  <div><h4>STS (Standard Term Support)</h4><p>Versions impaires (9, 11…). Supportées 2 ans. Pour profiter des nouveautés plus tôt.</p></div>
</div>
<p>Ce cours utilise <strong>.NET 10</strong>, une version LTS sortie en novembre 2025, avec <strong>C# 14</strong>. C'est comme choisir une version LTS de Node.js pour un projet sérieux.</p>

<h3>Et par rapport à TypeScript ?</h3>
<p>Tu as déjà de bons réflexes. TypeScript ajoute des types à JavaScript, puis tout redevient du JavaScript non typé à l'exécution. En C#, les types existent <strong>aussi pendant l'exécution</strong> : le runtime les connaît et les vérifie. La syntaxe te semblera familière (accolades, <code>if</code>, <code>class</code>, <code>async/await</code>), car les deux langages ont été conçus par la même personne, Anders Hejlsberg.</p>
<div class="tip">.NET est la plateforme, C# est le langage. On écrit « du C# » qui tourne « sur .NET », comme on écrit « du TypeScript » qui tourne « sur Node.js ».</div>
<div class="note">En entreprise, vérifie toujours la date de fin de support de la version utilisée (page « .NET releases and support »). Une application sur une version non supportée ne reçoit plus de correctifs de sécurité.</div>
`,
  examples: [
    {
      title: "Afficher du texte",
      code: `// Chaque ligne affiche un texte dans la console
Console.WriteLine("Bonjour .NET !");
Console.WriteLine("Ce programme est écrit en C#.");`,
      output: `Bonjour .NET !
Ce programme est écrit en C#.`,
      steps: [
        "<code>// Chaque ligne…</code> : un commentaire, ignoré par le compilateur, comme en TypeScript.",
        "<code>Console.WriteLine(\"Bonjour .NET !\");</code> : <code>Console</code> est une classe de la bibliothèque de base. <code>WriteLine</code> affiche le texte puis passe à la ligne, comme <code>console.log</code>.",
        "<code>Console.WriteLine(\"Ce programme…\");</code> : même chose pour la deuxième ligne. Note le point-virgule obligatoire à la fin."
      ],
      explain: "Tu n'as rien importé : la classe Console fait partie des bibliothèques fournies par .NET."
    },
    {
      title: "Interroger la plateforme",
      code: `using System.Runtime.InteropServices;

// Quelle version du runtime exécute ce programme ?
Console.WriteLine($"Version du runtime : {Environment.Version}");
// Sur quel système d'exploitation ?
Console.WriteLine($"Système : {RuntimeInformation.OSDescription}");
// Quel .NET exactement ?
Console.WriteLine($"Framework : {RuntimeInformation.FrameworkDescription}");`,
      output: `Version du runtime : 10.0.0
Système : Microsoft Windows 10.0.26200
Framework : .NET 10.0.0`,
      steps: [
        "<code>using System.Runtime.InteropServices;</code> : importe un espace de noms (un « dossier » de classes), comme un <code>import</code> en TypeScript. On en a besoin pour <code>RuntimeInformation</code>.",
        "<code>$\"Version du runtime : {Environment.Version}\"</code> : le <code>$</code> devant la chaîne active l'interpolation, l'équivalent des template literals de TypeScript. Le contenu entre accolades est remplacé par sa valeur.",
        "<code>Environment.Version</code> : la version du runtime en cours d'exécution.",
        "<code>RuntimeInformation.OSDescription</code> : une description du système d'exploitation.",
        "<code>RuntimeInformation.FrameworkDescription</code> : le nom complet du .NET utilisé."
      ],
      explain: "La sortie est indicative : elle dépend de ta machine (Windows, Linux ou macOS) et du numéro exact de .NET installé."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Te présenter",
      prompt: "<p>Écris un programme qui affiche trois lignes : ton prénom, ton métier, et la phrase « J'apprends C# sur .NET 10 ».</p>",
      hint: "<p>Utilise trois fois <code>Console.WriteLine(\"…\");</code>. N'oublie pas le point-virgule.</p>",
      solution: `Console.WriteLine("Kamal");
Console.WriteLine("Développeur fullstack");
Console.WriteLine("J'apprends C# sur .NET 10");`
    },
    {
      level: "moyen",
      title: "Fiche système",
      prompt: "<p>Affiche une petite fiche avec le nom de la machine (<code>Environment.MachineName</code>), la version du runtime (<code>Environment.Version</code>) et le système (<code>RuntimeInformation.OSDescription</code>). Utilise l'interpolation de chaîne.</p>",
      hint: "<p>N'oublie pas <code>using System.Runtime.InteropServices;</code> en haut, et le <code>$</code> devant chaque chaîne interpolée.</p>",
      solution: `using System.Runtime.InteropServices;

Console.WriteLine("=== Ma machine ===");
Console.WriteLine($"Nom : {Environment.MachineName}");
Console.WriteLine($"Runtime : {Environment.Version}");
Console.WriteLine($"Système : {RuntimeInformation.OSDescription}");`
    },
    {
      level: "difficile",
      title: "Tableau de correspondance",
      prompt: "<p>Affiche un petit tableau texte qui associe chaque brique .NET à son équivalent JavaScript : runtime → V8/Node.js, bibliothèques de base → modules intégrés, CLI dotnet → node/npm/tsc, NuGet → npm. Une ligne par correspondance, avec un titre.</p>",
      hint: "<p>Une ligne de <code>Console.WriteLine</code> par correspondance. Pour aligner, tu peux simplement ajouter des espaces dans tes chaînes.</p>",
      solution: `Console.WriteLine(".NET                  | JavaScript");
Console.WriteLine("----------------------+-------------------");
Console.WriteLine("Runtime (CLR)         | V8 / Node.js");
Console.WriteLine("Bibliothèques de base | Modules intégrés");
Console.WriteLine("CLI dotnet            | node / npm / tsc");
Console.WriteLine("NuGet                 | npm");`
    }
  ],
  quiz: [
    {
      q: "Quelle phrase décrit le mieux .NET ?",
      options: ["Un langage de programmation créé par Microsoft", "Une plateforme : runtime, bibliothèques et outils, utilisable avec plusieurs langages", "Un éditeur de code pour Windows"],
      answer: 1,
      why: ".NET est une plateforme complète. Le langage, c'est C# (ou F#, VB). L'éditeur, c'est Visual Studio ou VS Code : ce sont des outils à part."
    },
    {
      q: "Tu démarres un nouveau projet d'entreprise. Quelle version choisis-tu ?",
      options: [".NET Framework 4.8, parce qu'il est très connu", ".NET 9, parce que c'est une version STS", ".NET 10, parce que c'est la LTS actuelle"],
      answer: 2,
      why: "Pour un projet sérieux, on choisit la LTS la plus récente : 3 ans de support. .NET Framework est l'ancienne branche Windows uniquement, figée."
    },
    {
      q: "Quelle est une différence importante entre TypeScript et C# ?",
      options: ["En C#, les types existent encore pendant l'exécution", "C# n'a pas de classes", "TypeScript est compilé en code machine"],
      answer: 0,
      why: "TypeScript efface ses types en compilant vers JavaScript. En C#, le runtime connaît les types et les vérifie. C# a bien des classes, et TypeScript est compilé en JavaScript, pas en code machine."
    }
  ],
  resources: [
    { label: "Introduction à .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/introduction" },
    { label: "Versions et support de .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/releases-and-support" }
  ]
});

// ───────────────────────── 1.2 Comment ton code s'exécute ─────────────────────────
window.COURSE.push({
  key: "l-how-code-runs",
  title: "Comment ton code s'exécute",
  summary: "Tu sauras décrire le chemin de ton code C#, du fichier .cs jusqu'au processeur, en passant par l'IL, le CLR et le JIT.",
  objectives: [
    "Suivre le trajet : C# → compilateur → IL → CLR → JIT → code machine",
    "Comprendre ce qu'est l'IL et ce que contient un .dll",
    "Savoir ce que fait le CLR en plus d'exécuter (mémoire, sécurité des types)",
    "Comparer avec tsc → JavaScript → V8"
  ],
  analogy: `<p>Imagine un livre écrit en <strong>espéranto</strong>, une langue neutre. L'auteur (le compilateur) écrit une seule version. Ensuite, dans chaque pays, un <strong>interprète simultané</strong> traduit le texte dans la langue locale, au moment où on le lit. L'IL, c'est l'espéranto. Le JIT, c'est l'interprète qui traduit pour ton processeur précis, juste à temps.</p>`,
  lesson: `
<h3>Deux étapes au lieu d'une</h3>
<p>Ton code C# n'est pas compris directement par le processeur. Il passe par deux traductions. La première a lieu quand tu compiles (<code>dotnet build</code>). La seconde a lieu pendant l'exécution, au moment où le programme tourne.</p>
<div class="flow"><span>Program.cs</span><span>Compilateur Roslyn</span><span>IL dans un .dll</span><span>CLR + JIT</span><span>Code machine</span></div>
<p>Le <strong>compilateur</strong> s'appelle Roslyn. Il vérifie ton code (types, syntaxe) et le traduit en <strong>IL</strong> (Intermediate Language, « langage intermédiaire »). Cet IL est rangé dans un fichier <code>.dll</code>, qu'on appelle un <strong>assembly</strong>.</p>

<h3>À quoi ressemble l'IL ?</h3>
<p>L'IL est un langage simple, proche de la machine mais indépendant du processeur. Voici, simplifié, ce que devient une petite méthode <code>Add(a, b)</code> qui renvoie <code>a + b</code> :</p>
<pre class="diagram">
.method int32 Add(int32 a, int32 b)
{
  ldarg.0   // pose a sur la pile
  ldarg.1   // pose b sur la pile
  add       // additionne les deux
  ret       // renvoie le résultat
}
</pre>
<p>Tu n'écriras jamais d'IL à la main. Mais savoir qu'il existe explique beaucoup de choses : un même <code>.dll</code> tourne sous Windows, Linux ou macOS, et sur des processeurs Intel ou ARM.</p>

<h3>Le CLR et le JIT</h3>
<p>Quand tu lances ton programme, le <strong>CLR</strong> (Common Language Runtime) démarre. C'est le moteur d'exécution de .NET. Il charge ton assembly et confie l'IL au <strong>JIT</strong> (Just-In-Time, « juste à temps »).</p>
<p>Le JIT traduit chaque méthode en code machine <strong>la première fois qu'elle est appelée</strong>. Les appels suivants réutilisent directement cette traduction. C'est pour ça que le tout premier appel d'une méthode est un peu plus lent que les suivants.</p>

<h3>Le CLR fait bien plus qu'exécuter</h3>
<ul>
  <li><strong>Gestion de la mémoire</strong> : le ramasse-miettes (GC, Garbage Collector) libère automatiquement les objets que tu n'utilises plus. Pas de <code>free</code> à écrire, comme en JavaScript.</li>
  <li><strong>Sécurité des types</strong> : le CLR refuse de traiter un texte comme un nombre. Une conversion impossible déclenche une erreur au lieu de produire une valeur absurde.</li>
  <li><strong>Gestion des erreurs</strong> : il fournit les exceptions et la pile des appels (tu les verras au débogage).</li>
</ul>

<h3>Comparaison avec TypeScript</h3>
<div class="compare">
  <div><h4>TypeScript</h4><p><code>tsc</code> traduit le .ts en JavaScript. Les types disparaissent. Le moteur V8 lit le JS et le compile à la volée en code machine.</p></div>
  <div><h4>C#</h4><p>Roslyn traduit le .cs en IL. Les types restent dans l'IL. Le CLR lit l'IL et le JIT le compile à la volée en code machine.</p></div>
</div>
<p>Autre point commun : dans les deux cas, ton éditeur te signale les erreurs de type avant même l'exécution. Mais en C#, si tu forces une conversion impossible, le CLR t'arrête aussi pendant l'exécution.</p>
<p>Le principe est très proche : un compilateur produit un format intermédiaire, puis un moteur le compile à la volée. La grande différence, c'est que l'IL garde toutes les informations de type.</p>

<h3>Et l'AOT ?</h3>
<p>Il existe aussi une compilation <strong>AOT</strong> (Ahead-Of-Time, « à l'avance ») : avec Native AOT, tout est traduit en code machine dès la publication, ce qui donne un démarrage très rapide mais un exécutable lié à un système précis.</p>
<div class="tip">Le <code>.dll</code> produit par <code>dotnet build</code> contient de l'IL, pas du code machine. C'est le CLR qui le rend exécutable sur ta machine.</div>
`,
  examples: [
    {
      title: "Une méthode compilée en IL",
      code: `// Une petite méthode : le compilateur la traduit en IL
static int Add(int a, int b)
{
    return a + b;
}

// Premier appel : le JIT traduit Add en code machine
Console.WriteLine(Add(2, 3));
// Deuxième appel : la traduction est réutilisée
Console.WriteLine(Add(10, 20));`,
      output: `5
30`,
      steps: [
        "<code>static int Add(int a, int b)</code> : une méthode qui prend deux entiers (<code>int</code>) et renvoie un entier. Tu verras les méthodes en détail au chapitre 2.",
        "<code>return a + b;</code> : c'est cette ligne qui devient <code>ldarg.0</code>, <code>ldarg.1</code>, <code>add</code>, <code>ret</code> en IL.",
        "<code>Console.WriteLine(Add(2, 3));</code> : au premier appel, le JIT compile <code>Add</code> en code machine, puis l'exécute. Affiche 5.",
        "<code>Console.WriteLine(Add(10, 20));</code> : le code machine est déjà prêt, il est réutilisé. Affiche 30."
      ],
      explain: "Tu ne vois pas le JIT travailler : il agit en coulisses, une seule fois par méthode."
    },
    {
      title: "Tout vit dans des assemblies",
      code: `// Dans quel assembly (.dll) vit le type string ?
Console.WriteLine(typeof(string).Assembly.GetName().Name);
// Et la classe Console ?
Console.WriteLine(typeof(Console).Assembly.GetName().Name);
// Le type d'une valeur est connu pendant l'exécution
object value = 42;
Console.WriteLine(value.GetType().Name);`,
      output: `System.Private.CoreLib
System.Console
Int32`,
      steps: [
        "<code>typeof(string)</code> : récupère la description du type <code>string</code>. Possible car le CLR garde les types à l'exécution.",
        "<code>.Assembly.GetName().Name</code> : demande le nom de l'assembly qui contient ce type. <code>string</code> vit dans <code>System.Private.CoreLib</code>, le cœur de .NET.",
        "<code>typeof(Console)</code> : la classe <code>Console</code> vit dans son propre assembly, <code>System.Console.dll</code>.",
        "<code>object value = 42;</code> : on range un nombre dans une variable très générale (<code>object</code>).",
        "<code>value.GetType().Name</code> : le CLR sait quand même que c'est un <code>Int32</code> (le vrai nom de <code>int</code>). En TypeScript, cette information aurait disparu."
      ],
      explain: "Les bibliothèques de .NET sont elles aussi des assemblies remplis d'IL, exactement comme ton propre programme."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Remettre dans l'ordre",
      prompt: "<p>Écris un programme qui affiche, une étape par ligne, le trajet de ton code : Program.cs, Roslyn, IL dans un .dll, CLR, JIT, code machine.</p>",
      hint: "<p>Six <code>Console.WriteLine</code>. Tu peux numéroter chaque étape.</p>",
      solution: `Console.WriteLine("1. Program.cs (ton code C#)");
Console.WriteLine("2. Roslyn (le compilateur)");
Console.WriteLine("3. IL dans un .dll");
Console.WriteLine("4. CLR (le runtime)");
Console.WriteLine("5. JIT (traduction à la volée)");
Console.WriteLine("6. Code machine (le processeur)");`
    },
    {
      level: "moyen",
      title: "Le type à l'exécution",
      prompt: "<p>Crée trois variables de type <code>object</code> qui contiennent <code>3.5</code>, <code>\"texte\"</code> et <code>true</code>. Affiche le nom du vrai type de chacune avec <code>GetType().Name</code>.</p>",
      hint: "<p><code>object a = 3.5;</code> puis <code>Console.WriteLine(a.GetType().Name);</code>. Tu devrais obtenir <code>Double</code>, <code>String</code> et <code>Boolean</code>.</p>",
      solution: `object a = 3.5;
object b = "texte";
object c = true;

Console.WriteLine(a.GetType().Name); // Double
Console.WriteLine(b.GetType().Name); // String
Console.WriteLine(c.GetType().Name); // Boolean`
    },
    {
      level: "difficile",
      title: "Voir le vrai IL",
      prompt: "<p>Écris une méthode <code>Multiply(int a, int b)</code> qui renvoie <code>a * b</code> et appelle-la. Compile avec <code>dotnet build</code>, puis ouvre le <code>.dll</code> de <code>bin/Debug/net10.0</code> avec un outil gratuit comme ILSpy ou le site sharplab.io (colle ton code dans sharplab et choisis « IL »). Retrouve l'instruction qui fait la multiplication.</p>",
      hint: "<p>L'instruction IL de la multiplication s'appelle <code>mul</code>, comme <code>add</code> pour l'addition.</p>",
      solution: `static int Multiply(int a, int b)
{
    return a * b;
}

Console.WriteLine(Multiply(6, 7)); // 42

// Dans l'IL de Multiply, on retrouve :
//   ldarg.0
//   ldarg.1
//   mul
//   ret`
    }
  ],
  quiz: [
    {
      q: "Que contient le fichier .dll produit par <code>dotnet build</code> ?",
      options: ["Du code machine prêt pour ton processeur", "Du code C# compressé", "De l'IL (langage intermédiaire)"],
      answer: 2,
      why: "Le compilateur Roslyn produit de l'IL. C'est le JIT qui le traduit en code machine pendant l'exécution (sauf si tu utilises Native AOT)."
    },
    {
      q: "Quand le JIT traduit-il une méthode en code machine ?",
      options: ["La première fois qu'elle est appelée", "À chaque appel", "Pendant <code>dotnet build</code>"],
      answer: 0,
      why: "Le JIT compile « juste à temps », au premier appel, puis réutilise le résultat. Pendant le build, c'est Roslyn qui travaille, et il produit de l'IL."
    },
    {
      q: "Lequel de ces rôles n'appartient PAS au CLR ?",
      options: ["Libérer la mémoire inutilisée (GC)", "Vérifier la syntaxe de ton fichier .cs", "Empêcher de traiter un texte comme un nombre"],
      answer: 1,
      why: "La syntaxe est vérifiée par le compilateur Roslyn, avant l'exécution. Le CLR intervient ensuite : mémoire, sécurité des types, exceptions."
    }
  ],
  resources: [
    { label: "Processus d'exécution managée", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/managed-execution-process" }
  ]
});

// ───────────────────────── 1.3 Installer ton environnement ─────────────────────────
window.COURSE.push({
  key: "l-install",
  title: "Installer ton environnement",
  summary: "Tu sauras installer le SDK .NET 10, vérifier ton installation en ligne de commande et choisir ton éditeur.",
  objectives: [
    "Distinguer le SDK du runtime",
    "Installer le SDK .NET 10 sous Windows",
    "Vérifier l'installation avec <code>dotnet --version</code>, <code>--list-sdks</code> et <code>--info</code>",
    "Choisir un éditeur adapté"
  ],
  analogy: `<p>Le <strong>runtime</strong>, c'est un lecteur de DVD : il sait lire un film, mais pas en fabriquer. Le <strong>SDK</strong>, c'est tout le studio de cinéma : caméras, table de montage… et un lecteur de DVD pour vérifier le résultat. Toi qui fabriques des programmes, tu as besoin du studio complet, donc du SDK.</p>`,
  lesson: `
<h3>SDK ou runtime ?</h3>
<p>Sur la page de téléchargement de .NET, tu vois deux choses. Il faut savoir laquelle prendre.</p>
<div class="compare">
  <div><h4>Runtime</h4><p>Permet uniquement d'<strong>exécuter</strong> des applications .NET. C'est ce qu'on installe sur un serveur de production.</p></div>
  <div><h4>SDK (Software Development Kit)</h4><p>Permet de <strong>créer, compiler et exécuter</strong>. Il contient la commande <code>dotnet</code>, le compilateur et les runtimes.</p></div>
</div>
<p>En tant que développeur, tu installes le <strong>SDK</strong>. Il inclut déjà le runtime, inutile de l'installer à part. C'est un peu comme Node.js, qui fournit à la fois <code>node</code> et <code>npm</code>.</p>

<h3>Installer le SDK .NET 10</h3>
<p>Sous Windows, le plus simple est <strong>winget</strong>, le gestionnaire de paquets intégré à Windows. Ouvre un terminal (PowerShell ou Terminal Windows) et tape :</p>
<p><code>winget install Microsoft.DotNet.SDK.10</code></p>
<p>Tu peux aussi télécharger l'installeur depuis le site officiel <code>dot.net</code> (rubrique Download), ou passer par Homebrew sur macOS et le gestionnaire de paquets de ta distribution sur Linux. Après l'installation, <strong>ferme et rouvre ton terminal</strong> pour qu'il trouve la commande <code>dotnet</code>.</p>

<h3>Vérifier que tout marche</h3>
<p>Trois commandes à connaître :</p>
<table>
  <tr><th>Commande</th><th>Ce qu'elle affiche</th></tr>
  <tr><td><code>dotnet --version</code></td><td>La version du SDK utilisé dans le dossier courant</td></tr>
  <tr><td><code>dotnet --list-sdks</code></td><td>Tous les SDK installés, avec leur dossier</td></tr>
  <tr><td><code>dotnet --list-runtimes</code></td><td>Tous les runtimes installés</td></tr>
  <tr><td><code>dotnet --info</code></td><td>Un rapport complet : SDK, runtimes, système, chemins</td></tr>
</table>
<p>Tu peux avoir plusieurs SDK installés côte à côte (par exemple 8 et 10). Par défaut, <code>dotnet</code> utilise le plus récent. C'est différent de Node, où l'on passe souvent par <code>nvm</code> pour changer de version.</p>

<h3>Choisir ton éditeur</h3>
<table>
  <tr><th>Éditeur</th><th>Points forts</th><th>Pour qui ?</th></tr>
  <tr><td>Visual Studio Community</td><td>IDE complet, débogueur très riche, gratuit pour un usage individuel</td><td>Windows, si tu veux tout intégré</td></tr>
  <tr><td>VS Code + C# Dev Kit</td><td>Léger, tu le connais déjà pour Angular</td><td>Le plus simple pour démarrer quand on vient du front</td></tr>
  <tr><td>JetBrains Rider</td><td>Très puissant, multiplateforme</td><td>Si tu aimes WebStorm ; gratuit pour un usage non commercial</td></tr>
</table>
<p>Pour ce cours, <strong>VS Code avec l'extension C# Dev Kit</strong> suffit largement. Les raccourcis de débogage (F5, F10, F11) sont les mêmes partout.</p>

<h3>Le terminal reste ton meilleur ami</h3>
<p>Quel que soit l'éditeur, tout passe par la commande <code>dotnet</code> : créer un projet, compiler, lancer, ajouter un package. Les éditeurs ne font qu'appeler cette commande pour toi. Si quelque chose ne marche pas dans l'éditeur, essaie la même action dans le terminal : le message d'erreur y est souvent plus clair.</p>
<h3>Un SDK par projet ?</h3>
<p>Tu peux fixer la version du SDK utilisée par un projet avec un petit fichier <code>global.json</code> placé à sa racine. C'est utile en équipe, pour que tout le monde compile avec la même version. Sans ce fichier, la commande <code>dotnet</code> prend simplement le SDK le plus récent installé sur ta machine.</p>
<p>Pour débuter, tu n'en as pas besoin : un seul SDK, le 10, suffit pour tout ce cours. Retiens seulement que plusieurs SDK peuvent cohabiter sans se gêner, et que les mettre à jour ne casse pas tes anciens projets.</p>
<div class="tip">Si <code>dotnet</code> n'est pas reconnu après l'installation, c'est presque toujours parce que le terminal était déjà ouvert. Ferme-le, rouvre-le, et réessaie.</div>
`,
  examples: [
    {
      title: "Vérifier la version installée",
      code: `# Installer le SDK .NET 10 (Windows)
winget install Microsoft.DotNet.SDK.10

# Puis, dans un NOUVEAU terminal :
dotnet --version`,
      output: `10.0.100`,
      steps: [
        "<code>winget install Microsoft.DotNet.SDK.10</code> : demande à Windows d'installer le SDK .NET 10. Le texte affiché pendant l'installation n'est pas reproduit ici.",
        "<code># Puis, dans un NOUVEAU terminal</code> : le terminal doit être rouvert pour connaître la commande <code>dotnet</code>.",
        "<code>dotnet --version</code> : affiche la version du SDK. Un numéro qui commence par <code>10.</code> confirme que tout est en place."
      ],
      explain: "La sortie est indicative : le dernier chiffre change à chaque mise à jour du SDK (10.0.100, 10.0.101…)."
    },
    {
      title: "Lister les SDK et les runtimes",
      code: `# Les SDK installés
dotnet --list-sdks

# Les runtimes installés
dotnet --list-runtimes`,
      output: `10.0.100 [C:\\Program Files\\dotnet\\sdk]
Microsoft.AspNetCore.App 10.0.0 [C:\\Program Files\\dotnet\\shared\\Microsoft.AspNetCore.App]
Microsoft.NETCore.App 10.0.0 [C:\\Program Files\\dotnet\\shared\\Microsoft.NETCore.App]
Microsoft.WindowsDesktop.App 10.0.0 [C:\\Program Files\\dotnet\\shared\\Microsoft.WindowsDesktop.App]`,
      steps: [
        "<code>dotnet --list-sdks</code> : une ligne par SDK, avec son numéro et son dossier d'installation.",
        "<code>dotnet --list-runtimes</code> : une ligne par runtime. Le SDK en a installé plusieurs d'un coup.",
        "<code>Microsoft.NETCore.App</code> : le runtime de base, celui qui fait tourner les applications console.",
        "<code>Microsoft.AspNetCore.App</code> : le runtime pour les APIs et sites web (ASP.NET Core).",
        "<code>Microsoft.WindowsDesktop.App</code> : le runtime pour les applications desktop Windows (présent uniquement sous Windows)."
      ],
      explain: "Sortie indicative : tes numéros et chemins peuvent différer, et tu verras d'autres lignes si tu as d'anciennes versions."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ta version",
      prompt: "<p>Installe le SDK .NET 10 puis lance <code>dotnet --version</code>. Note le numéro obtenu.</p>",
      hint: "<p>Si la commande n'est pas reconnue, ferme et rouvre ton terminal.</p>",
      solution: `winget install Microsoft.DotNet.SDK.10
# Nouveau terminal
dotnet --version
# Exemple de résultat : 10.0.100`
    },
    {
      level: "moyen",
      title: "Lire le rapport complet",
      prompt: "<p>Lance <code>dotnet --info</code>. Dans le résultat, retrouve : la version du SDK, le nom de ton système d'exploitation et le dossier où .NET est installé.</p>",
      hint: "<p>Cherche les sections « .NET SDK », « Runtime Environment » (avec « OS Name ») et « Base Path ».</p>",
      solution: `dotnet --info
# Dans la sortie :
#  .NET SDK: Version: 10.0.100      -> version du SDK
#  Runtime Environment: OS Name: Windows -> système
#  Base Path: C:\\Program Files\\dotnet\\sdk\\10.0.100\\ -> dossier`
    },
    {
      level: "difficile",
      title: "Préparer VS Code",
      prompt: "<p>Installe l'extension C# Dev Kit dans VS Code depuis le terminal, puis vérifie qu'elle apparaît dans la liste des extensions installées.</p>",
      hint: "<p>La commande <code>code</code> de VS Code accepte <code>--install-extension</code> et <code>--list-extensions</code>. L'identifiant de l'extension est <code>ms-dotnettools.csdevkit</code>.</p>",
      solution: `code --install-extension ms-dotnettools.csdevkit
code --list-extensions
# La liste doit contenir :
#  ms-dotnettools.csdevkit
#  ms-dotnettools.csharp (installée automatiquement avec)`
    }
  ],
  quiz: [
    {
      q: "Tu veux écrire et compiler des programmes C#. Qu'installes-tu ?",
      options: ["Le SDK .NET", "Uniquement le runtime .NET", "Uniquement Visual Studio Code"],
      answer: 0,
      why: "Le SDK contient le compilateur, la commande dotnet et les runtimes. Le runtime seul permet d'exécuter, pas de compiler. VS Code est un éditeur : il a besoin du SDK pour compiler."
    },
    {
      q: "Que fait <code>dotnet --list-sdks</code> ?",
      options: ["Installe le dernier SDK", "Affiche tous les SDK installés sur la machine", "Liste les packages NuGet du projet"],
      answer: 1,
      why: "Cette commande liste simplement les SDK présents, avec leur dossier. Elle n'installe rien et ne concerne pas les packages."
    },
    {
      q: "Juste après l'installation, <code>dotnet</code> n'est pas reconnu. Cause la plus probable ?",
      options: ["Le SDK est incompatible avec Windows", "Il faut redémarrer l'ordinateur deux fois", "Le terminal était ouvert avant l'installation"],
      answer: 2,
      why: "Le terminal lit la liste des chemins (PATH) à son ouverture. Il faut en ouvrir un nouveau pour qu'il voie dotnet. Pas besoin de redémarrer l'ordinateur."
    }
  ],
  resources: [
    { label: "Installer .NET sur Windows", url: "https://learn.microsoft.com/fr-fr/dotnet/core/install/windows" }
  ]
});

// ───────────────────────── 1.4 Ton premier programme ─────────────────────────
window.COURSE.push({
  key: "l-first-program",
  title: "Ton premier programme",
  summary: "Tu sauras créer, comprendre, compiler et lancer une application console C#, et reconnaître ses deux styles d'écriture.",
  objectives: [
    "Créer une application console avec <code>dotnet new console</code>",
    "Comprendre les fichiers générés et les dossiers bin/obj",
    "Lire un programme en top-level statements et en méthode Main classique",
    "Écrire commentaires, points-virgules et accolades correctement"
  ],
  analogy: `<p>Un programme, c'est une pièce de théâtre. Il faut savoir où commence le spectacle : c'est le <strong>point d'entrée</strong>. Avant, on écrivait tout un décor autour (une classe, une méthode <code>Main</code>) pour dire « le rideau se lève ici ». Aujourd'hui, C# te laisse monter directement sur scène : la première ligne du fichier, c'est le début du spectacle.</p>`,
  lesson: `
<h3>Créer le projet</h3>
<p>Dans un terminal, place-toi dans un dossier de travail et tape :</p>
<p><code>dotnet new console -n Hello</code></p>
<p><code>dotnet new</code> crée un projet à partir d'un <strong>modèle</strong> (template), ici <code>console</code>. L'option <code>-n Hello</code> donne le nom du projet et crée un dossier <code>Hello</code>. C'est l'équivalent de <code>ng new</code> ou <code>npm init</code>, en beaucoup plus léger.</p>

<h3>Ce qu'il y a dans le dossier</h3>
<pre class="diagram">
Hello/
 ├── Hello.csproj   description du projet
 ├── Program.cs     ton code
 └── obj/           fichiers techniques du build
</pre>
<p><code>Hello.csproj</code> joue le rôle du <code>package.json</code> : il décrit le projet (tu le verras en détail dans la leçon suivante). <code>Program.cs</code> contient une seule ligne : <code>Console.WriteLine("Hello, World!");</code>. Le <code>.cs</code> est l'extension des fichiers C#, comme <code>.ts</code> pour TypeScript.</p>

<h3>Lancer et compiler</h3>
<div class="flow"><span>dotnet new</span><span>dotnet build</span><span>dotnet run</span></div>
<p><code>dotnet build</code> compile le projet : il produit l'IL dans <code>bin/Debug/net10.0/Hello.dll</code>. <code>dotnet run</code> compile si besoin, puis lance le programme. Au quotidien, tu utiliseras surtout <code>dotnet run</code>.</p>
<ul>
  <li><strong>bin/</strong> : le résultat final (le <code>.dll</code>, et sous Windows un <code>Hello.exe</code> pour lancer facilement). C'est un peu ton <code>dist/</code>.</li>
  <li><strong>obj/</strong> : des fichiers intermédiaires du build. Tu n'y touches jamais.</li>
</ul>
<p>Ces deux dossiers se régénèrent à chaque build : on les ajoute toujours au <code>.gitignore</code>, comme <code>node_modules</code>.</p>

<h3>Que se passe-t-il pendant <code>dotnet run</code> ?</h3>
<p>La commande enchaîne trois actions. D'abord, elle vérifie que les dépendances du projet sont présentes (on en reparlera avec NuGet). Ensuite, elle compile si un fichier a changé depuis le dernier build. Enfin, elle lance le programme et affiche sa sortie dans ton terminal.</p>
<p>Si tu as une erreur de compilation, le programme ne démarre pas : le terminal affiche le fichier, la ligne, la colonne et un code d'erreur commençant par <code>CS</code>. Lis toujours ce message en entier, il est en général très précis.</p>
<h3>Deux façons d'écrire le point d'entrée</h3>
<div class="compare">
  <div><h4>Top-level statements (moderne)</h4><p>Tu écris directement les instructions dans <code>Program.cs</code>. Le compilateur génère la classe et la méthode <code>Main</code> pour toi. C'est le style par défaut, et celui de ce cours.</p></div>
  <div><h4>Méthode Main classique</h4><p>Une classe <code>Program</code> qui contient <code>static void Main(string[] args)</code>. Tu la verras dans beaucoup de projets existants et de tutoriels anciens.</p></div>
</div>
<p>Les deux produisent exactement le même programme. Une seule règle : un projet n'a qu'un seul fichier avec des top-level statements.</p>

<h3>La syntaxe de base, vue depuis TypeScript</h3>
<table>
  <tr><th>Élément</th><th>TypeScript</th><th>C#</th></tr>
  <tr><td>Point-virgule</td><td>Facultatif</td><td><strong>Obligatoire</strong> à la fin de chaque instruction</td></tr>
  <tr><td>Accolades</td><td>Délimitent les blocs</td><td>Pareil, mais on les place souvent sur leur propre ligne</td></tr>
  <tr><td>Commentaires</td><td><code>//</code> et <code>/* */</code></td><td>Identiques, plus <code>///</code> pour la documentation</td></tr>
  <tr><td>Guillemets</td><td><code>'</code> ou <code>"</code></td><td><code>"</code> pour du texte, <code>'</code> pour un seul caractère</td></tr>
</table>
<p>C# est aussi <strong>sensible à la casse</strong> : <code>console.writeline</code> ne marche pas, il faut <code>Console.WriteLine</code>. Les méthodes commencent par une majuscule, c'est la convention .NET (PascalCase).</p>
<div class="tip">L'oubli du point-virgule est l'erreur n°1 des développeurs JavaScript qui débutent en C#. Le compilateur te le signale avec le code d'erreur <code>CS1002</code> : « ; attendu ».</div>
`,
  examples: [
    {
      title: "Le programme généré",
      code: `// Program.cs généré par dotnet new console
// See https://aka.ms/new-console-template for more information
Console.WriteLine("Hello, World!");`,
      output: `Hello, World!`,
      steps: [
        "<code>// Program.cs généré…</code> : un commentaire que j'ai ajouté pour situer le fichier.",
        "<code>// See https://aka.ms/…</code> : le commentaire placé par le modèle, avec un lien vers la documentation.",
        "<code>Console.WriteLine(\"Hello, World!\");</code> : la seule vraie instruction. Pas de classe, pas de <code>Main</code> : ce sont des top-level statements.",
        "<code>dotnet run</code> : dans le terminal, après <code>cd Hello</code>, lance le programme et affiche le message."
      ],
      explain: "Une ligne suffit pour un programme complet : le compilateur ajoute le reste pour toi."
    },
    {
      title: "Le même programme, version classique",
      code: `namespace Hello;

internal class Program
{
    // Le point d'entrée : la première méthode appelée
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
    }
}`,
      output: `Hello, World!`,
      steps: [
        "<code>namespace Hello;</code> : range le code dans un espace de noms, un peu comme un module. Tu le verras au chapitre 3.",
        "<code>internal class Program</code> : une classe nommée <code>Program</code>, visible seulement dans ce projet.",
        "<code>static void Main(string[] args)</code> : la méthode <code>Main</code> est le point d'entrée. <code>void</code> veut dire qu'elle ne renvoie rien. <code>args</code> contient les arguments passés en ligne de commande.",
        "<code>Console.WriteLine(\"Hello, World!\");</code> : la même instruction qu'avant, mais placée dans <code>Main</code>.",
        "<code>{ }</code> : chaque bloc (namespace, classe, méthode) est délimité par des accolades, comme en TypeScript."
      ],
      explain: "Remplace le contenu de Program.cs par ce code : le résultat est identique."
    },
    {
      title: "Commentaires et instructions",
      code: `// Commentaire sur une ligne

/* Commentaire
   sur plusieurs lignes */

Console.WriteLine("Première ligne"); // commentaire en fin de ligne
Console.WriteLine("Deuxième ligne");

{
    // Un bloc entre accolades regroupe des instructions
    Console.WriteLine("Dans un bloc");
}`,
      output: `Première ligne
Deuxième ligne
Dans un bloc`,
      steps: [
        "<code>// Commentaire sur une ligne</code> : tout ce qui suit <code>//</code> est ignoré jusqu'à la fin de la ligne.",
        "<code>/* … */</code> : un commentaire qui peut couvrir plusieurs lignes.",
        "<code>Console.WriteLine(\"Première ligne\"); // …</code> : une instruction, son point-virgule, puis un commentaire.",
        "<code>{ … }</code> : un bloc. Ici il ne sert qu'à montrer la syntaxe ; tu en utiliseras partout avec <code>if</code>, les boucles et les méthodes."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ton Hello",
      prompt: "<p>Crée un projet console nommé <code>Hello</code>, modifie <code>Program.cs</code> pour afficher « Bonjour, je m'appelle … » avec ton prénom, puis lance-le.</p>",
      hint: "<p><code>dotnet new console -n Hello</code>, puis <code>cd Hello</code>, modifie le fichier, et <code>dotnet run</code>.</p>",
      solution: `// Program.cs
Console.WriteLine("Bonjour, je m'appelle Kamal");

// Dans le terminal :
// dotnet new console -n Hello
// cd Hello
// dotnet run`
    },
    {
      level: "moyen",
      title: "Corriger les erreurs",
      prompt: "<p>Ce code ne compile pas. Trouve et corrige les trois erreurs :</p><p><code>console.WriteLine('Bonjour')</code><br><code>Console.writeLine(\"Au revoir\");</code></p>",
      hint: "<p>Regarde la casse (majuscules), le type de guillemets et la fin de la première ligne.</p>",
      solution: `// 1. Console avec une majuscule
// 2. Guillemets doubles pour du texte, et point-virgule
Console.WriteLine("Bonjour");
// 3. WriteLine avec une majuscule
Console.WriteLine("Au revoir");`
    },
    {
      level: "difficile",
      title: "Lire les arguments",
      prompt: "<p>En version classique (avec <code>Main</code>), écris un programme qui affiche le nombre d'arguments reçus. Lance-le avec <code>dotnet run -- un deux trois</code>. Bonus : en top-level statements, la variable <code>args</code> existe aussi, essaie !</p>",
      hint: "<p><code>args.Length</code> donne le nombre d'éléments du tableau <code>args</code>. Tout ce qui suit <code>--</code> dans <code>dotnet run</code> est transmis à ton programme.</p>",
      solution: `namespace Hello;

internal class Program
{
    static void Main(string[] args)
    {
        // dotnet run -- un deux trois  =>  Arguments reçus : 3
        Console.WriteLine($"Arguments reçus : {args.Length}");
    }
}`
    }
  ],
  quiz: [
    {
      q: "Où <code>dotnet build</code> place-t-il le résultat compilé ?",
      options: ["Dans <code>obj/</code>", "Dans <code>bin/Debug/net10.0/</code>", "À côté de <code>Program.cs</code>"],
      answer: 1,
      why: "Le résultat final va dans bin/ (configuration Debug, framework net10.0). obj/ ne contient que des fichiers intermédiaires du build."
    },
    {
      q: "Avec les top-level statements, qui écrit la méthode <code>Main</code> ?",
      options: ["Le compilateur, automatiquement", "Personne : le programme n'a pas de point d'entrée", "Le développeur, dans un autre fichier"],
      answer: 0,
      why: "Le compilateur génère la classe et la méthode Main autour de tes instructions. Il y a donc bien un point d'entrée, tu ne l'écris simplement pas."
    },
    {
      q: "Laquelle de ces lignes est correcte en C# ?",
      options: ["<code>console.log(\"Salut\");</code>", "<code>Console.WriteLine('Salut');</code>", "<code>Console.WriteLine(\"Salut\");</code>"],
      answer: 2,
      why: "console.log est du JavaScript. En C#, les apostrophes entourent un seul caractère : 'Salut' ne compile pas. Le texte se met entre guillemets doubles."
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 1.</strong> Crée l'application console : <code>dotnet new console -n Library</code>. Remplace le contenu de <code>Program.cs</code> pour afficher un menu de bienvenue :</p>
<pre class="diagram">
=== Bibliothèque municipale ===
1. Lister les livres
2. Emprunter un livre
3. Rendre un livre
0. Quitter
</pre>
<p>Pour l'instant, le menu ne fait qu'afficher du texte (une ligne <code>Console.WriteLine</code> par ligne du menu). Ajoute un commentaire en haut du fichier qui décrit le projet, puis lance-le avec <code>dotnet run</code>.</p>`,
  resources: [
    { label: "Instructions de niveau supérieur (top-level statements)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/program-structure/top-level-statements" }
  ]
});

// ───────────────────────── 1.5 Projets, solutions et .csproj ─────────────────────────
window.COURSE.push({
  key: "l-projects",
  title: "Projets, solutions et fichier .csproj",
  summary: "Tu sauras lire un fichier .csproj, regrouper plusieurs projets dans une solution et relier un projet à un autre.",
  objectives: [
    "Comprendre qu'un projet produit un assembly (.dll ou .exe)",
    "Lire un .csproj ligne par ligne",
    "Créer une solution, y ajouter des projets et des références",
    "Distinguer les configurations Debug et Release"
  ],
  analogy: `<p>Imagine un classeur avec des intercalaires. Chaque <strong>intercalaire</strong> est un projet : il a son propre contenu et produit sa propre fiche finale (un <code>.dll</code>). Le <strong>classeur</strong>, c'est la solution : il ne contient pas de code lui-même, il regroupe les intercalaires pour que tu les manipules ensemble. Et quand un intercalaire dit « voir page 3 de l'intercalaire Domaine », c'est une <strong>référence de projet</strong>.</p>`,
  lesson: `
<h3>Un projet = un assembly</h3>
<p>Chaque projet .NET est décrit par un fichier <code>.csproj</code> et produit <strong>un seul assembly</strong> : un <code>.dll</code> (bibliothèque) ou un exécutable. Si tu veux séparer ton code en plusieurs morceaux réutilisables, tu crées plusieurs projets.</p>
<p>Côté front, c'est proche d'un monorepo Angular avec plusieurs <code>projects/</code> : une application et des librairies qu'elle importe.</p>

<h3>Anatomie d'un .csproj</h3>
<p>Le <code>.csproj</code> est un fichier XML. Depuis .NET Core, il est au format « SDK-style » : très court, car le SDK applique de bonnes valeurs par défaut. Voici celui d'une application console :</p>
<table>
  <tr><th>Ligne</th><th>Signification</th></tr>
  <tr><td><code>&lt;Project Sdk="Microsoft.NET.Sdk"&gt;</code></td><td>Le type de SDK utilisé. Pour une API web, ce serait <code>Microsoft.NET.Sdk.Web</code>.</td></tr>
  <tr><td><code>&lt;OutputType&gt;Exe&lt;/OutputType&gt;</code></td><td>Produit un programme exécutable. Absent pour une bibliothèque.</td></tr>
  <tr><td><code>&lt;TargetFramework&gt;net10.0&lt;/TargetFramework&gt;</code></td><td>La version de .NET visée.</td></tr>
  <tr><td><code>&lt;ImplicitUsings&gt;enable&lt;/ImplicitUsings&gt;</code></td><td>Importe automatiquement les espaces de noms courants (<code>System</code>, <code>System.IO</code>…). C'est pour ça que <code>Console</code> marche sans <code>using</code>.</td></tr>
  <tr><td><code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code></td><td>Active les avertissements sur les valeurs nulles, comme <code>strictNullChecks</code> en TypeScript. Tu le verras au chapitre 4.</td></tr>
</table>
<p>Point important : tu n'as <strong>pas</strong> besoin de lister tes fichiers <code>.cs</code>. Tous ceux du dossier sont compilés automatiquement.</p>

<h3>La solution : regrouper des projets</h3>
<p>Une <strong>solution</strong> est un fichier qui liste plusieurs projets. Historiquement c'est un <code>.sln</code>, au format peu lisible. Il existe maintenant le format <code>.slnx</code>, en XML simple, que le SDK .NET 10 crée par défaut. Les deux jouent le même rôle : ouvrir tous les projets d'un coup dans l'éditeur et tout compiler avec un seul <code>dotnet build</code>.</p>
<pre class="diagram">
Library/
 ├── Library.slnx
 ├── Library.Domain/      (classlib : livres, membres)
 │    └── Library.Domain.csproj
 └── Library.Console/     (console : le menu)
      └── Library.Console.csproj
            └── référence -> Library.Domain
</pre>
<p>Le projet <code>Library.Domain</code> contient la logique métier. Le projet <code>Library.Console</code> s'occupe de l'affichage et <strong>référence</strong> le premier pour utiliser ses classes. La référence va dans un seul sens : le domaine ne connaît pas la console.</p>

<h3>Les commandes utiles</h3>
<div class="flow"><span>dotnet new sln</span><span>dotnet new classlib / console</span><span>dotnet sln add</span><span>dotnet add reference</span></div>
<p><code>dotnet new classlib</code> crée une bibliothèque (pas de <code>OutputType</code>, pas de point d'entrée). <code>dotnet sln add</code> inscrit un projet dans la solution. <code>dotnet add … reference …</code> ajoute une référence de projet dans le <code>.csproj</code>.</p>

<h3>Debug ou Release ?</h3>
<div class="compare">
  <div><h4>Debug (par défaut)</h4><p>Code peu optimisé, mais facile à déboguer pas à pas. Sortie dans <code>bin/Debug/</code>.</p></div>
  <div><h4>Release</h4><p>Code optimisé pour la production. Sortie dans <code>bin/Release/</code>. On l'obtient avec <code>dotnet build -c Release</code>.</p></div>
</div>
<p>C'est l'équivalent du mode développement et du build de production d'Angular. Pendant tout l'apprentissage, tu resteras en Debug ; Release servira quand tu publieras ton application.</p>
<div class="tip">Ce que tu nommes <code>Library.Console</code> crée un espace de noms <code>Library.Console</code>. Dans un fichier qui déclare <code>namespace Library.Console;</code>, le mot <code>Console</code> désigne alors cet espace de noms et <code>Console.WriteLine</code> ne compile plus. Solution : écrire <code>System.Console.WriteLine</code>, ou nommer le projet <code>Library.App</code>.</div>
<div class="note">En équipe, une solution sépare presque toujours le domaine (règles métier, sans dépendance technique) de l'interface (console, API web). Ce découpage te permettra de remplacer la console par une API sans toucher au domaine.</div>
`,
  examples: [
    {
      title: "Le .csproj d'une application console",
      code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>`,
      output: ``,
      steps: [
        "<code>&lt;Project Sdk=\"Microsoft.NET.Sdk\"&gt;</code> : la racine du fichier, avec le SDK standard.",
        "<code>&lt;PropertyGroup&gt;</code> : un groupe de réglages du projet.",
        "<code>&lt;OutputType&gt;Exe&lt;/OutputType&gt;</code> : on produit un programme qu'on peut lancer.",
        "<code>&lt;TargetFramework&gt;net10.0&lt;/TargetFramework&gt;</code> : on vise .NET 10.",
        "<code>&lt;ImplicitUsings&gt;</code> et <code>&lt;Nullable&gt;</code> : imports automatiques et vérification des valeurs nulles, tous deux activés."
      ],
      explain: "Ce fichier ne s'exécute pas : c'est la configuration du projet, rien n'est affiché."
    },
    {
      title: "Créer la solution Library",
      code: `# Un dossier pour toute la solution
mkdir Library
cd Library

dotnet new sln -n Library
dotnet new classlib -n Library.Domain
dotnet new console -n Library.Console

dotnet sln add Library.Domain Library.Console
dotnet add Library.Console reference Library.Domain

dotnet build`,
      output: `Build succeeded in 2,1s`,
      steps: [
        "<code>dotnet new sln -n Library</code> : crée le fichier de solution <code>Library.slnx</code>.",
        "<code>dotnet new classlib -n Library.Domain</code> : crée une bibliothèque de classes dans le dossier <code>Library.Domain</code>.",
        "<code>dotnet new console -n Library.Console</code> : crée l'application console.",
        "<code>dotnet sln add Library.Domain Library.Console</code> : inscrit les deux projets dans la solution.",
        "<code>dotnet add Library.Console reference Library.Domain</code> : la console peut maintenant utiliser les classes du domaine. Une ligne <code>&lt;ProjectReference&gt;</code> apparaît dans son .csproj.",
        "<code>dotnet build</code> : compile toute la solution, dans le bon ordre (le domaine d'abord)."
      ],
      explain: "Sortie indicative : dotnet build affiche aussi une ligne par projet compilé, et la durée varie."
    },
    {
      title: "Savoir dans quel mode on tourne",
      code: `// DEBUG est défini automatiquement en configuration Debug
#if DEBUG
Console.WriteLine("Mode : Debug");
#else
Console.WriteLine("Mode : Release");
#endif`,
      output: `Mode : Debug`,
      steps: [
        "<code>#if DEBUG</code> : une directive lue par le compilateur, pas une condition exécutée. Le symbole <code>DEBUG</code> existe seulement en configuration Debug.",
        "<code>Console.WriteLine(\"Mode : Debug\");</code> : compilé uniquement en Debug.",
        "<code>#else</code> … <code>#endif</code> : la branche compilée en Release, puis la fin de la directive.",
        "<code>dotnet run -c Release</code> : avec un simple <code>dotnet run</code> (Debug par défaut), tu obtiens « Mode : Debug » ; avec <code>-c Release</code>, « Mode : Release »."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire un .csproj",
      prompt: "<p>Ouvre le <code>.csproj</code> de ton projet <code>Hello</code>. Indique quelle ligne dit qu'il s'agit d'un programme exécutable, et quelle ligne donne la version de .NET.</p>",
      hint: "<p>Cherche <code>OutputType</code> et <code>TargetFramework</code>.</p>",
      solution: `<!-- Programme exécutable -->
<OutputType>Exe</OutputType>
<!-- Version de .NET -->
<TargetFramework>net10.0</TargetFramework>`
    },
    {
      level: "moyen",
      title: "Release",
      prompt: "<p>Compile ton projet en configuration Release, puis liste le contenu du dossier produit. Quelle différence de chemin vois-tu avec Debug ?</p>",
      hint: "<p>Utilise l'option <code>-c Release</code>. Regarde ensuite dans <code>bin/</code>.</p>",
      solution: `dotnet build -c Release
ls bin/Release/net10.0
# Debug   -> bin/Debug/net10.0/
# Release -> bin/Release/net10.0/`
    },
    {
      level: "difficile",
      title: "Ajouter un projet de tests à la solution",
      prompt: "<p>Dans la solution <code>Library</code>, ajoute un troisième projet <code>Library.Tests</code> de type <code>xunit</code>, inscris-le dans la solution et fais-le référencer <code>Library.Domain</code>. Vérifie avec <code>dotnet sln list</code>.</p>",
      hint: "<p>Même enchaînement que pour la console : <code>dotnet new</code>, <code>dotnet sln add</code>, <code>dotnet add … reference …</code>. Le modèle s'appelle <code>xunit</code>.</p>",
      solution: `dotnet new xunit -n Library.Tests
dotnet sln add Library.Tests
dotnet add Library.Tests reference Library.Domain
dotnet sln list
# Library.Domain\\Library.Domain.csproj
# Library.Console\\Library.Console.csproj
# Library.Tests\\Library.Tests.csproj`
    }
  ],
  quiz: [
    {
      q: "Que produit un projet .NET quand on le compile ?",
      options: ["Un assembly (.dll ou exécutable)", "Un fichier .sln", "Autant de .dll que de fichiers .cs"],
      answer: 0,
      why: "Un projet = un assembly, quel que soit le nombre de fichiers .cs. Le .sln (ou .slnx) est le fichier de solution, il n'est pas produit par la compilation."
    },
    {
      q: "Pourquoi peut-on écrire <code>Console.WriteLine</code> sans aucun <code>using</code> ?",
      options: ["Parce que Console fait partie du langage C#", "Grâce à <code>&lt;ImplicitUsings&gt;enable&lt;/ImplicitUsings&gt;</code>", "Grâce à <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code>"],
      answer: 1,
      why: "ImplicitUsings importe automatiquement System et d'autres espaces de noms courants. Console est une classe de bibliothèque, pas un mot du langage. Nullable concerne les valeurs nulles."
    },
    {
      q: "Quelle commande permet à Library.Console d'utiliser les classes de Library.Domain ?",
      options: ["<code>dotnet sln add Library.Domain</code>", "<code>dotnet add Library.Domain reference Library.Console</code>", "<code>dotnet add Library.Console reference Library.Domain</code>"],
      answer: 2,
      why: "On ajoute la référence dans le projet qui utilise (la console) vers le projet utilisé (le domaine). sln add inscrit seulement le projet dans la solution, sans créer de lien entre projets."
    },
    {
      q: "Quelle configuration utiliser pour déployer en production ?",
      options: ["Debug", "Release", "Peu importe, c'est identique"],
      answer: 1,
      why: "Release active les optimisations du compilateur. Debug garde un code facile à déboguer mais moins performant."
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 2.</strong> Transforme ton application en solution. Dans un nouveau dossier <code>Library</code>, crée la solution <code>Library</code>, une bibliothèque <code>Library.Domain</code> et une console <code>Library.Console</code>. Ajoute les deux projets à la solution et la référence de la console vers le domaine. Recopie ton menu de bienvenue dans <code>Library.Console/Program.cs</code>, puis lance-le avec <code>dotnet run --project Library.Console</code>. Supprime le fichier <code>Class1.cs</code> généré dans le domaine : tu y ajouteras tes vraies classes au chapitre 3.</p>`,
  resources: [
    { label: "Vue d'ensemble des SDK de projet .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/project-sdk/overview" },
    { label: "Commande dotnet sln", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tools/dotnet-sln" }
  ]
});

// ───────────────────────── 1.6 NuGet ─────────────────────────
window.COURSE.push({
  key: "l-nuget",
  title: "NuGet : utiliser des bibliothèques",
  summary: "Tu sauras ajouter un package NuGet à un projet, comprendre ce que ça change dans le .csproj, et choisir un package fiable.",
  objectives: [
    "Faire le parallèle entre npm et NuGet",
    "Ajouter un package avec <code>dotnet add package</code>",
    "Lire une <code>PackageReference</code> et comprendre le restore",
    "Évaluer un package avant de l'utiliser"
  ],
  analogy: `<p>Tu cuisines et il te manque une sauce. Tu peux la préparer toi-même pendant une heure, ou acheter un pot fait par un artisan reconnu. <strong>NuGet</strong>, c'est l'épicerie : des milliers de pots (packages) prêts à l'emploi. Ta liste de courses, c'est le <code>.csproj</code>. Et comme pour une vraie épicerie, on lit l'étiquette avant d'acheter.</p>`,
  lesson: `
<h3>NuGet, le npm de .NET</h3>
<p>Un <strong>package</strong> est une bibliothèque emballée pour être partagée. <strong>NuGet</strong> est le gestionnaire de packages de .NET, et <strong>nuget.org</strong> est le registre public où ils sont publiés. Tu connais déjà le principe :</p>
<table>
  <tr><th>Concept</th><th>npm</th><th>NuGet</th></tr>
  <tr><td>Registre public</td><td>npmjs.com</td><td>nuget.org</td></tr>
  <tr><td>Ajouter un package</td><td><code>npm install lodash</code></td><td><code>dotnet add package Humanizer</code></td></tr>
  <tr><td>Liste des dépendances</td><td><code>package.json</code></td><td>Le <code>.csproj</code></td></tr>
  <tr><td>Récupérer les dépendances</td><td><code>npm install</code></td><td><code>dotnet restore</code> (souvent automatique)</td></tr>
  <tr><td>Où sont stockés les fichiers</td><td><code>node_modules/</code> dans chaque projet</td><td>Un cache global dans ton profil utilisateur</td></tr>
</table>
<p>La dernière ligne est une vraie différence : pas de dossier géant dans ton projet. Les packages sont téléchargés une seule fois dans <code>%USERPROFILE%\\.nuget\\packages</code> et partagés entre tous tes projets.</p>

<h3>Ajouter un package</h3>
<div class="flow"><span>dotnet add package</span><span>PackageReference dans le .csproj</span><span>restore (téléchargement)</span><span>using + utilisation</span></div>
<p>La commande <code>dotnet add package Humanizer</code> fait deux choses : elle ajoute une ligne <code>&lt;PackageReference&gt;</code> dans ton <code>.csproj</code>, puis elle télécharge le package. Ensuite, tu ajoutes un <code>using</code> en haut de ton fichier pour utiliser ses classes.</p>
<p>Avec .NET 10, tu peux aussi écrire <code>dotnet package add Humanizer</code> : c'est la même chose avec l'ordre « nom puis verbe ».</p>

<h3>Le restore</h3>
<p>Le mot vient de l'anglais « restaurer » : on remet en place ce qui manque. Le <strong>restore</strong> lit les <code>PackageReference</code> et télécharge ce qui manque dans le cache. Tu n'as presque jamais besoin de le lancer toi-même : <code>dotnet build</code> et <code>dotnet run</code> le font automatiquement. Quand tu clones un projet depuis Git, un simple <code>dotnet build</code> suffit, là où il faudrait d'abord un <code>npm install</code>.</p>

<h3>Les versions</h3>
<p>NuGet utilise le même principe de versions que npm : <code>MAJEUR.MINEUR.CORRECTIF</code>. Une différence importante : dans une <code>PackageReference</code>, <code>Version="2.14.1"</code> veut dire « au minimum 2.14.1 », et NuGet prend la plus petite version qui convient. Pas de <code>^</code> ni de <code>~</code> : la version que tu écris est celle que tu obtiens. Pour mettre à jour, tu relances <code>dotnet add package</code> (qui prend la dernière version) ou tu ajoutes <code>--version</code>.</p>

<h3>Choisir un package fiable</h3>
<p>Ajouter un package, c'est faire confiance à du code écrit par d'autres. Avant de l'installer, regarde sa page sur nuget.org :</p>
<ul>
  <li><strong>Téléchargements</strong> : des millions, c'est bon signe ; quelques centaines, prudence.</li>
  <li><strong>Maintenance</strong> : date de la dernière version, activité du dépôt GitHub lié.</li>
  <li><strong>Compatibilité</strong> : l'onglet « Frameworks » doit inclure ton .NET (ou <code>netstandard2.0</code>, compatible partout).</li>
  <li><strong>Licence</strong> : MIT ou Apache 2.0 sont sans souci ; certaines licences sont payantes pour un usage commercial.</li>
  <li><strong>Éditeur</strong> : une coche bleue indique un préfixe de nom réservé et vérifié (par exemple <code>Microsoft.*</code>).</li>
</ul>
<div class="tip">Avant d'ajouter un package, vérifie si .NET ne le fait pas déjà. La bibliothèque de base est très riche : JSON, HTTP, dates, fichiers… Contrairement à l'écosystème npm, on a besoin de beaucoup moins de dépendances.</div>
<div class="note">Lance régulièrement <code>dotnet list package --vulnerable</code> pour détecter les packages qui ont des failles connues, et <code>dotnet list package --outdated</code> pour voir ceux qui ont une version plus récente.</div>
`,
  examples: [
    {
      title: "Ajouter Humanizer",
      code: `# Dans le dossier du projet
dotnet add package Humanizer`,
      output: `info : Adding PackageReference for package 'Humanizer' into project 'Hello.csproj'.
info : PackageReference for package 'Humanizer' version '2.14.1' added to file 'Hello.csproj'.`,
      steps: [
        "<code># Dans le dossier du projet</code> : la commande cherche le .csproj dans le dossier courant.",
        "<code>dotnet add package Humanizer</code> : télécharge la dernière version stable de Humanizer et l'inscrit dans le .csproj.",
        "<code>info : PackageReference …</code> : la sortie confirme la version ajoutée et le fichier modifié."
      ],
      explain: "Sortie indicative et raccourcie : la commande affiche plus de lignes, et la version sera la plus récente au moment où tu la lances."
    },
    {
      title: "La ligne ajoutée dans le .csproj",
      code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Humanizer" Version="2.14.1" />
  </ItemGroup>

</Project>`,
      output: ``,
      steps: [
        "<code>&lt;PropertyGroup&gt;</code> : les réglages du projet, inchangés.",
        "<code>&lt;ItemGroup&gt;</code> : un groupe d'éléments (packages, fichiers, références de projets).",
        "<code>&lt;PackageReference Include=\"Humanizer\" Version=\"2.14.1\" /&gt;</code> : la dépendance. C'est l'équivalent d'une ligne dans <code>dependencies</code> du <code>package.json</code>."
      ],
      explain: "Tu peux aussi écrire cette ligne à la main : le prochain build fera le restore."
    },
    {
      title: "Utiliser Humanizer",
      code: `using Humanizer;

// Transforme un identifiant en texte lisible
Console.WriteLine("PascalCaseInputString".Humanize());
// Met au pluriel (règles anglaises)
Console.WriteLine("Book".Pluralize());
// Coupe un texte trop long
Console.WriteLine("Long text to truncate".Truncate(10));`,
      output: `Pascal case input string
Books
Long text…`,
      steps: [
        "<code>using Humanizer;</code> : importe l'espace de noms du package, comme un <code>import</code> depuis un module npm.",
        "<code>\"PascalCaseInputString\".Humanize()</code> : Humanizer ajoute des méthodes aux chaînes de caractères. Celle-ci découpe le PascalCase en mots.",
        "<code>\"Book\".Pluralize()</code> : met le mot au pluriel selon les règles anglaises.",
        "<code>\"Long text to truncate\".Truncate(10)</code> : garde 10 caractères au total, points de suspension compris."
      ],
      explain: "Ces méthodes semblent appartenir à string : ce sont des méthodes d'extension, que tu apprendras à écrire au chapitre 5."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Installer et utiliser",
      prompt: "<p>Dans un nouveau projet console, ajoute Humanizer et affiche <code>\"MaPremiereBibliotheque\".Humanize()</code>.</p>",
      hint: "<p><code>dotnet add package Humanizer</code>, puis <code>using Humanizer;</code> en haut de <code>Program.cs</code>.</p>",
      solution: `using Humanizer;

Console.WriteLine("MaPremiereBibliotheque".Humanize());
// Ma premiere bibliotheque`
    },
    {
      level: "moyen",
      title: "Version précise",
      prompt: "<p>Ajoute le package <code>Newtonsoft.Json</code> en version exacte <code>13.0.3</code>, puis vérifie la ligne ajoutée dans le .csproj et la liste des packages du projet.</p>",
      hint: "<p>L'option <code>--version</code> de <code>dotnet add package</code>, puis <code>dotnet list package</code>.</p>",
      solution: `dotnet add package Newtonsoft.Json --version 13.0.3
dotnet list package
# Dans le .csproj :
# <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />`
    },
    {
      level: "difficile",
      title: "Enquête de fiabilité",
      prompt: "<p>Sur nuget.org, compare deux packages de ton choix (par exemple <code>Humanizer</code> et <code>Spectre.Console</code>). Pour chacun, relève : nombre total de téléchargements, date de la dernière version, licence, frameworks compatibles. Lequel adopterais-tu dans un projet d'entreprise, et pourquoi ?</p>",
      hint: "<p>Toutes ces informations sont sur la page du package : en haut (téléchargements), dans l'onglet « Versions », dans le bloc « License » et dans l'onglet « Frameworks ».</p>",
      solution: `# Grille de comparaison (à remplir avec les valeurs du jour)
# Critère             | Humanizer | Spectre.Console
# Téléchargements     | ...       | ...
# Dernière version    | ...       | ...
# Licence             | MIT       | MIT
# Frameworks          | ...       | ...
# Conclusion : les deux sont très téléchargés, maintenus
# et sous licence MIT : adoptables en entreprise.`
    }
  ],
  quiz: [
    {
      q: "Où sont stockés les fichiers d'un package NuGet après le restore ?",
      options: ["Dans un dossier <code>node_modules</code> du projet", "Dans un cache global partagé par tous tes projets", "Directement dans le fichier .csproj"],
      answer: 1,
      why: "NuGet télécharge chaque package une seule fois dans un cache global (dossier .nuget/packages de ton profil). Le .csproj ne contient que la référence, pas le code."
    },
    {
      q: "Tu clones un projet .NET. Que dois-tu lancer pour récupérer les packages ?",
      options: ["Rien de spécial : <code>dotnet build</code> fait le restore automatiquement", "<code>npm install</code>", "<code>dotnet add package</code> pour chaque package"],
      answer: 0,
      why: "build et run déclenchent le restore tout seuls. dotnet add package sert à ajouter une nouvelle dépendance, pas à récupérer celles qui existent."
    },
    {
      q: "Quel signal doit te rendre prudent avant d'ajouter un package ?",
      options: ["Une licence MIT", "Un éditeur avec une coche bleue", "Aucune nouvelle version depuis des années et peu de téléchargements"],
      answer: 2,
      why: "Un package abandonné et peu utilisé risque d'avoir des bugs ou des failles jamais corrigés. MIT est une licence permissive, et la coche bleue indique un préfixe vérifié : deux bons signes."
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 3.</strong> Dans <code>Library.Console</code>, ajoute le package Humanizer. Utilise-le pour afficher un sous-titre à partir d'un identifiant : <code>"GestionDesEmpruntsEtDesMembres".Humanize()</code> sous le titre du menu. Optionnel : si tu veux un menu plus joli, essaie le package <code>Spectre.Console</code> et remplace le titre par <code>AnsiConsole.Write(new FigletText("Library"));</code> (avec <code>using Spectre.Console;</code>). Vérifie ensuite la <code>PackageReference</code> ajoutée dans <code>Library.Console.csproj</code>.</p>`,
  resources: [
    { label: "Qu'est-ce que NuGet ?", url: "https://learn.microsoft.com/fr-fr/nuget/what-is-nuget" },
    { label: "Installer et utiliser un package avec la CLI dotnet", url: "https://learn.microsoft.com/fr-fr/nuget/quickstart/install-and-use-a-package-using-the-dotnet-cli" }
  ]
});

// ───────────────────────── 1.7 Déboguer pas à pas ─────────────────────────
window.COURSE.push({
  key: "l-debugging",
  title: "Déboguer pas à pas",
  summary: "Tu sauras arrêter ton programme sur une ligne, l'avancer pas à pas, inspecter les variables et lire une exception pour trouver un bug.",
  objectives: [
    "Poser un point d'arrêt, simple ou conditionnel",
    "Avancer avec F5, F10 et F11",
    "Lire les fenêtres Variables, Espion et Pile des appels",
    "Lire une exception et sa stack trace"
  ],
  analogy: `<p>Déboguer avec des <code>Console.WriteLine</code>, c'est regarder un film en ne voyant que quelques photos prises au hasard. Le <strong>débogueur</strong>, c'est la télécommande : tu mets <strong>pause</strong> (point d'arrêt), tu avances <strong>image par image</strong> (pas à pas) et tu peux zoomer sur chaque détail (les variables). Le bug ne peut plus se cacher entre deux photos.</p>`,
  lesson: `
<h3>Le point d'arrêt</h3>
<p>Un <strong>point d'arrêt</strong> (breakpoint) est un marqueur sur une ligne : quand le programme l'atteint, il se met en pause <strong>avant</strong> d'exécuter cette ligne. Pour en poser un, clique dans la marge à gauche du numéro de ligne (un point rouge apparaît) ou appuie sur <strong>F9</strong>.</p>
<p>Lance ensuite le programme <strong>avec le débogueur</strong> : touche <strong>F5</strong> dans Visual Studio, VS Code ou Rider. <code>dotnet run</code> lance sans débogueur : les points d'arrêt sont alors ignorés.</p>

<h3>Avancer pas à pas</h3>
<table>
  <tr><th>Touche</th><th>Nom</th><th>Ce qu'elle fait</th></tr>
  <tr><td><strong>F5</strong></td><td>Continuer</td><td>Reprend jusqu'au prochain point d'arrêt (ou la fin)</td></tr>
  <tr><td><strong>F10</strong></td><td>Pas à pas principal</td><td>Exécute la ligne entière, sans entrer dans les méthodes appelées</td></tr>
  <tr><td><strong>F11</strong></td><td>Pas à pas détaillé</td><td>Entre à l'intérieur de la méthode appelée sur cette ligne</td></tr>
  <tr><td><strong>Maj+F11</strong></td><td>Pas à pas sortant</td><td>Termine la méthode en cours et revient à l'appelant</td></tr>
</table>
<p>Règle simple : <strong>F10</strong> par défaut, <strong>F11</strong> quand tu soupçonnes la méthode appelée. C'est exactement ce que tu fais déjà dans les DevTools de Chrome, avec d'autres touches.</p>

<h3>Inspecter ce qui se passe</h3>
<p>Pendant la pause, plusieurs fenêtres t'aident :</p>
<ul>
  <li><strong>Variables</strong> (Locals) : toutes les variables visibles à cet endroit, avec leur valeur et leur type.</li>
  <li><strong>Espion</strong> (Watch) : des expressions que tu choisis, par exemple <code>total / notes.Length</code>, recalculées à chaque pas.</li>
  <li><strong>Pile des appels</strong> (Call Stack) : la chaîne des méthodes qui ont mené ici, la plus récente en haut.</li>
</ul>
<p>Tu peux aussi survoler une variable dans le code pour voir sa valeur. Le débogueur montre le <strong>type</strong> de chaque valeur : très utile en C#, où <code>13</code> (un <code>int</code>) et <code>13.0</code> (un <code>double</code>) ne se comportent pas pareil.</p>

<h3>Le point d'arrêt conditionnel</h3>
<p>Ce point d'arrêt est indispensable quand le bug n'apparaît que pour une valeur précise. Dans une boucle de 1000 tours, s'arrêter à chaque tour est pénible. Fais un clic droit sur le point d'arrêt, choisis « Conditions », et écris par exemple <code>note &gt; 15</code>. Le programme ne s'arrêtera que lorsque la condition est vraie.</p>

<h3>Console.WriteLine ou débogueur ?</h3>
<div class="compare">
  <div><h4>Console.WriteLine</h4><p>Rapide pour vérifier une valeur. Mais il faut modifier le code, relancer, puis penser à tout retirer.</p></div>
  <div><h4>Débogueur</h4><p>Aucune modification du code. Tu vois toutes les variables, à chaque étape, et tu peux suivre la piste sans relancer.</p></div>
</div>

<h3>Lire une exception</h3>
<p>Quand une erreur grave survient, .NET lève une <strong>exception</strong> : un objet qui décrit le problème. Si personne ne la gère, le programme s'arrête et affiche :</p>
<div class="flow"><span>Type de l'exception</span><span>Message</span><span>Stack trace</span></div>
<p>La <strong>stack trace</strong> (trace de la pile) liste les méthodes en cours au moment de l'erreur, la plus récente en premier, avec le fichier et le numéro de ligne. Lis-la de haut en bas : la première ligne qui pointe vers <strong>ton</strong> code est presque toujours l'endroit à regarder. Lancé avec F5, le débogueur s'arrête directement sur cette ligne.</p>
<div class="tip">En C#, diviser un entier par un entier donne un entier : <code>41 / 3</code> vaut <code>13</code>, pas <code>13.67</code>. Ce n'est pas une erreur, donc aucune exception : seul le débogueur (ou un test) te le révèle.</div>
`,
  examples: [
    {
      title: "Une moyenne fausse",
      code: `int[] notes = { 12, 15, 14 };
int total = 0;

foreach (int note in notes)
{
    total += note;
}

// Point d'arrêt ici : regarde total et notes.Length
double average = total / notes.Length;
Console.WriteLine($"Moyenne : {average}");`,
      output: `Moyenne : 13`,
      steps: [
        "<code>int[] notes = { 12, 15, 14 };</code> : un tableau de trois entiers. Tu verras les tableaux au chapitre 2.",
        "<code>foreach (int note in notes) { total += note; }</code> : additionne chaque note dans <code>total</code>. Avec F10, observe <code>total</code> passer à 12, 27, puis 41.",
        "<code>double average = total / notes.Length;</code> : pose un point d'arrêt ici. La fenêtre Variables montre <code>total = 41</code> et <code>notes.Length = 3</code>, deux <code>int</code>.",
        "<code>total / notes.Length</code> : ajoute cette expression en espion, elle vaut <code>13</code>. La division est faite entre entiers <strong>avant</strong> d'être rangée dans un <code>double</code>.",
        "<code>Console.WriteLine($\"Moyenne : {average}\");</code> : affiche 13 au lieu de 13,67. Le bug est trouvé."
      ],
      explain: "Le type double de average ne sauve rien : le calcul a déjà perdu la partie décimale."
    },
    {
      title: "La moyenne corrigée",
      code: `using System.Globalization;

int[] notes = { 12, 15, 14 };
int total = 0;

foreach (int note in notes)
{
    total += note;
}

// On convertit total en double AVANT la division
double average = (double)total / notes.Length;
Console.WriteLine("Moyenne : " + average.ToString("F2", CultureInfo.InvariantCulture));`,
      output: `Moyenne : 13.67`,
      steps: [
        "<code>using System.Globalization;</code> : donne accès à <code>CultureInfo</code>, pour un affichage indépendant de la langue du système.",
        "<code>(double)total</code> : convertit <code>total</code> en nombre décimal. Une division entre un <code>double</code> et un <code>int</code> donne un <code>double</code>.",
        "<code>double average = … / notes.Length;</code> : vaut maintenant 13,666…",
        "<code>average.ToString(\"F2\", CultureInfo.InvariantCulture)</code> : arrondit à 2 décimales avec un point comme séparateur."
      ],
      explain: "Relance avec F5 et le même point d'arrêt : l'espion affiche maintenant 13.666666666666666."
    },
    {
      title: "Lire une exception",
      code: `int[] notes = { };
Console.WriteLine(Average(notes));

static int Average(int[] values)
{
    int total = 0;
    foreach (int value in values)
    {
        total += value;
    }
    return total / values.Length;
}`,
      output: `Unhandled exception. System.DivideByZeroException: Attempted to divide by zero.
   at Program.<<Main>$>g__Average|0_0(Int32[] values) in C:\\dev\\Hello\\Program.cs:line 11
   at Program.<Main>$(String[] args) in C:\\dev\\Hello\\Program.cs:line 2`,
      steps: [
        "<code>int[] notes = { };</code> : un tableau vide, donc <code>notes.Length</code> vaut 0.",
        "<code>return total / values.Length;</code> : division entière par zéro. Le CLR lève une <code>DivideByZeroException</code>.",
        "<code>System.DivideByZeroException: Attempted to divide by zero.</code> : le type de l'exception, puis son message.",
        "<code>at Program.&lt;&lt;Main&gt;$&gt;g__Average|0_0 … line 11</code> : la ligne la plus récente. Le nom bizarre est celui que le compilateur donne à <code>Average</code>. L'erreur est à la ligne 11.",
        "<code>at Program.&lt;Main&gt;$ … line 2</code> : la méthode appelante, le programme principal, ligne 2. C'est la pile des appels, lue de haut en bas."
      ],
      explain: "Sortie indicative : le chemin du fichier dépend de ton dossier, et le message peut être traduit selon la langue de ton système."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Suivre une variable",
      prompt: "<p>Copie l'exemple « Une moyenne fausse ». Pose un point d'arrêt sur la ligne <code>total += note;</code>, lance avec F5, puis appuie plusieurs fois sur F5. Note la valeur de <code>total</code> à chaque arrêt.</p>",
      hint: "<p>Le programme s'arrête <strong>avant</strong> d'exécuter la ligne : au premier arrêt, <code>total</code> vaut encore 0.</p>",
      solution: `// Valeurs de total à chaque arrêt sur "total += note;" :
// 1er arrêt : total = 0  (note = 12)
// 2e arrêt  : total = 12 (note = 15)
// 3e arrêt  : total = 27 (note = 14)
// Après la boucle : total = 41`
    },
    {
      level: "moyen",
      title: "Point d'arrêt conditionnel",
      prompt: "<p>Écris une boucle qui additionne les nombres de 1 à 100 dans une variable <code>sum</code>. Pose un point d'arrêt conditionnel qui ne s'arrête que quand <code>i == 50</code>. Quelle est la valeur de <code>sum</code> à ce moment-là ?</p>",
      hint: "<p>Pose le point d'arrêt sur <code>sum += i;</code>. Comme il s'arrête avant la ligne, <code>sum</code> contient la somme de 1 à 49.</p>",
      solution: `int sum = 0;
for (int i = 1; i <= 100; i++)
{
    sum += i; // point d'arrêt, condition : i == 50
}
Console.WriteLine(sum); // 5050

// À l'arrêt (i == 50), sum vaut 1 + 2 + ... + 49 = 1225`
    },
    {
      level: "difficile",
      title: "Protéger la moyenne",
      prompt: "<p>Reprends l'exemple « Lire une exception ». Modifie <code>Average</code> pour qu'elle renvoie un <code>double</code> correct (pas de division entière) et qu'elle renvoie 0 si le tableau est vide. Vérifie au débogueur avec <code>{ 12, 15, 14 }</code> puis avec <code>{ }</code>.</p>",
      hint: "<p>Teste <code>values.Length == 0</code> avec un <code>if</code> au début de la méthode, et convertis <code>total</code> en <code>double</code> avant la division.</p>",
      solution: `using System.Globalization;

Console.WriteLine(Average(new[] { 12, 15, 14 }).ToString("F2", CultureInfo.InvariantCulture)); // 13.67
Console.WriteLine(Average(new int[] { }).ToString("F2", CultureInfo.InvariantCulture));        // 0.00

static double Average(int[] values)
{
    if (values.Length == 0)
    {
        return 0;
    }

    int total = 0;
    foreach (int value in values)
    {
        total += value;
    }
    return (double)total / values.Length;
}`
    }
  ],
  quiz: [
    {
      q: "Tu es arrêté sur une ligne qui appelle <code>ComputePenalty(5)</code>. Tu veux voir ce qui se passe à l'intérieur. Quelle touche ?",
      options: ["F10", "F5", "F11"],
      answer: 2,
      why: "F11 (pas à pas détaillé) entre dans la méthode appelée. F10 l'exécute d'un bloc sans y entrer, et F5 reprend jusqu'au prochain point d'arrêt."
    },
    {
      q: "Que vaut <code>double d = 7 / 2;</code> ?",
      options: ["3", "3.5", "4"],
      answer: 0,
      why: "7 et 2 sont des int : la division est entière et donne 3, qui est ensuite rangé dans le double. Pour obtenir 3.5, il faut qu'un des deux soit un double, par exemple 7.0 / 2."
    },
    {
      q: "Dans une stack trace, quelle ligne regarder en premier ?",
      options: ["La dernière ligne, le point d'entrée du programme", "La première ligne qui pointe vers ton propre code", "N'importe laquelle, l'ordre n'a pas d'importance"],
      answer: 1,
      why: "La pile est listée de l'appel le plus récent au plus ancien. La première ligne de ton code est l'endroit où l'erreur s'est produite ; les lignes du bas montrent seulement comment on y est arrivé."
    },
    {
      q: "Tes points d'arrêt sont ignorés. Pourquoi ?",
      options: ["Tu as lancé avec <code>dotnet run</code> au lieu de F5", "Tu es en configuration Debug", "Ton fichier contient des commentaires"],
      answer: 0,
      why: "dotnet run lance le programme sans débogueur attaché. Il faut démarrer avec F5 (« Démarrer le débogage ») depuis l'éditeur. La configuration Debug est justement celle qui facilite le débogage."
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 4.</strong> Un collègue a écrit cette fonction de calcul de pénalités de retard. La règle : 0,50 € par jour de retard, plafonné à 10 €. Colle-la dans <code>Library.Console/Program.cs</code> :</p>
<pre><code>static decimal ComputePenalty(int daysLate)
{
    decimal penalty = 0;
    for (int day = 1; day &lt; daysLate; day++)
    {
        penalty += 0.5m;
    }
    return penalty &gt; 10 ? 10 : penalty;
}

Console.WriteLine(ComputePenalty(4)); // attendu : 2,0
</code></pre>
<p>Le résultat est faux. Pose un point d'arrêt dans la boucle, avance avec F10 et surveille <code>day</code> et <code>penalty</code> dans la fenêtre Espion. Combien de tours fait la boucle pour 4 jours ? Corrige le bug, puis vérifie avec un point d'arrêt conditionnel (<code>day == 20</code>) sur un appel <code>ComputePenalty(25)</code> que le plafond fonctionne.</p>`,
  resources: [
    { label: "Découvrir le débogueur Visual Studio", url: "https://learn.microsoft.com/fr-fr/visualstudio/debugger/debugger-feature-tour" },
    { label: "Déboguer une application console .NET avec VS Code", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tutorials/debugging-with-visual-studio-code" }
  ]
});
