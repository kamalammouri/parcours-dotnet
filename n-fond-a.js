window.COURSE = window.COURSE || [];

// ───────────────────────────── f-platform ─────────────────────────────
window.COURSE.push({
  key: "f-platform",
  title: "La plateforme .NET",
  summary: "Comprendre ce qu'est .NET, comment ton code C# devient du code machine, et installer ton environnement de travail.",
  objectives: [
    "Situer .NET Framework, .NET Core et .NET 5+ dans l'histoire et savoir lequel choisir",
    "Expliquer le chemin du code : C# → Roslyn → IL → CLR → JIT → code machine",
    "Distinguer CLR, CTS, CLS, BCL, SDK et runtime",
    "Installer le SDK .NET 10, vérifier l'installation et choisir un éditeur",
    "Faire le parallèle avec Node.js, npm et tsc que tu connais déjà"
  ],
  lesson: `
<h3>.NET en une phrase</h3>
<p>.NET est une <strong>plateforme de développement</strong> gratuite et open source de Microsoft. Elle réunit trois choses : des <strong>langages</strong> (C# surtout, mais aussi F# et VB.NET), un <strong>environnement d'exécution</strong> (le CLR, l'équivalent du moteur V8 dans Node.js) et une très grande <strong>bibliothèque standard</strong> (la BCL : fichiers, réseau, JSON, collections, dates, cryptographie…). On l'utilise pour écrire des APIs web, des sites, des applications desktop et mobiles, des services cloud, des jeux (Unity) et des outils en ligne de commande, sur Windows, Linux et macOS.</p>
<p>Quand une offre d'emploi parle de « .NET », elle désigne en général l'ensemble <strong>C# + ASP.NET Core + Entity Framework Core</strong>, sur une version récente de .NET.</p>

<h3>Petite histoire : du .NET Framework à .NET 10</h3>
<p>Tu vas croiser plusieurs noms qui se ressemblent. Ce n'est pas un détail : en entreprise, tu tomberas sur du code de chaque époque.</p>
<table>
<thead><tr><th>Nom</th><th>Période</th><th>Caractéristiques</th></tr></thead>
<tbody>
<tr><td>.NET Framework 1.0 → 4.8.1</td><td>2002 → 2022</td><td>Windows uniquement, intégré au système. Toujours supporté (correctifs de sécurité) mais <strong>plus aucune nouveauté</strong>. ASP.NET MVC 5, Web Forms, WCF, <code>web.config</code>.</td></tr>
<tr><td>.NET Core 1.0 → 3.1</td><td>2016 → 2019</td><td>Réécriture multiplateforme, open source, rapide. ASP.NET Core naît ici.</td></tr>
<tr><td>.NET 5, 6, 7, 8, 9, 10…</td><td>2020 → aujourd'hui</td><td>Le mot « Core » disparaît : c'est <strong>le</strong> .NET unifié. Une version majeure chaque novembre.</td></tr>
</tbody>
</table>
<p>Chaque version est soit <strong>LTS</strong> (Long Term Support, 3 ans de support : les versions paires 6, 8, 10), soit <strong>STS</strong> (Standard Term Support, 2 ans : les versions impaires 7, 9, 11). <strong>.NET 10, sorti en novembre 2025, est LTS</strong> : c'est la version à utiliser pour apprendre et pour un nouveau projet. Les entreprises restent en général sur les LTS.</p>
<p>Règle pratique : si tu vois <code>&lt;TargetFramework&gt;net48&lt;/TargetFramework&gt;</code> dans un projet, c'est du .NET Framework (ancien monde). Si tu vois <code>net8.0</code> ou <code>net10.0</code>, c'est du .NET moderne.</p>

<h3>Comment ton code s'exécute : Roslyn, IL, CLR, JIT</h3>
<p>En TypeScript, <code>tsc</code> transforme ton code en JavaScript, puis V8 l'interprète et le compile à la volée. .NET fonctionne de façon assez proche, en deux étapes :</p>
<pre><code>Program.cs ──(Roslyn, à la compilation)──► MonApp.dll (code IL)
MonApp.dll ──(CLR + JIT, à l'exécution)──► code machine x64 / ARM64</code></pre>
<ul>
<li><strong>Roslyn</strong> est le compilateur C#. Il vérifie les types (c'est là que tu as tes erreurs rouges) et produit de l'<strong>IL</strong> (Intermediate Language), un bytecode indépendant du processeur, rangé dans un fichier <code>.dll</code>.</li>
<li><strong>Le CLR</strong> (Common Language Runtime) charge ce <code>.dll</code>, gère la mémoire avec le <strong>garbage collector</strong> (comme en JS, tu ne libères pas la mémoire à la main), les exceptions, les threads et la sécurité des types.</li>
<li><strong>Le JIT</strong> (Just-In-Time compiler) compile chaque méthode en code machine natif <strong>la première fois qu'elle est appelée</strong>. Le CLR utilise une compilation par paliers (<em>tiered compilation</em>) : une version rapide à produire d'abord, puis une version très optimisée pour les méthodes souvent appelées.</li>
</ul>
<p>Il existe aussi <strong>Native AOT</strong> (Ahead-Of-Time) : tout est compilé en code machine dès la publication. Le démarrage est quasi instantané et l'exécutable est autonome, au prix de restrictions (moins de réflexion dynamique). On s'en sert pour des outils CLI, des fonctions serverless ou des conteneurs très légers. Pour apprendre, reste sur le JIT classique.</p>

<h3>CTS et CLS : un système de types commun</h3>
<p>Le <strong>CTS</strong> (Common Type System) définit les types que le CLR comprend : <code>System.Int32</code>, <code>System.String</code>, <code>System.Object</code>… Les mots-clés C# sont des <strong>alias</strong> de ces types : <code>int</code> = <code>System.Int32</code>, <code>string</code> = <code>System.String</code>, <code>bool</code> = <code>System.Boolean</code>. Écrire <code>int</code> ou <code>Int32</code> donne exactement le même IL. La convention est d'utiliser les mots-clés (<code>int</code>, <code>string</code>).</p>
<p>Le <strong>CLS</strong> (Common Language Specification) est le sous-ensemble du CTS que tous les langages .NET doivent supporter. C'est grâce à lui qu'une bibliothèque écrite en F# s'utilise depuis C#. Tu n'auras presque jamais à t'en soucier.</p>

<h3>La BCL : la bibliothèque standard</h3>
<p>La <strong>BCL</strong> (Base Class Library) est énorme comparée à celle de Node.js. Là où tu installerais un paquet npm, .NET a souvent déjà la réponse : <code>System.Text.Json</code> (JSON), <code>System.Net.Http</code> (HTTP), <code>System.IO</code> (fichiers), <code>System.Collections.Generic</code> (listes, dictionnaires), <code>System.Linq</code> (requêtes sur collections), <code>System.Security.Cryptography</code>, <code>System.Text.RegularExpressions</code>… Avant d'ajouter une dépendance, vérifie toujours si la BCL ne le fait pas déjà.</p>

<h3>Assemblies : les fichiers .dll et .exe</h3>
<p>Une <strong>assembly</strong> est l'unité de déploiement de .NET : un fichier <code>.dll</code> qui contient l'IL, les métadonnées (la description de tous les types et méthodes) et un manifeste (nom, version, dépendances). Un projet produit une assembly. Une application console produit un <code>MonApp.dll</code> plus un petit lanceur <code>MonApp.exe</code> sous Windows. Une bibliothèque de classes produit seulement un <code>.dll</code>, que d'autres projets référencent.</p>
<p>Comme les métadonnées décrivent tout, des outils comme <strong>ILSpy</strong> ou <strong>sharplab.io</strong> peuvent te montrer l'IL et même reconstruire du C# à partir d'un <code>.dll</code>. C'est très formateur pour comprendre ce que le compilateur génère.</p>

<h3>SDK ou runtime ?</h3>
<table>
<thead><tr><th></th><th>Runtime</th><th>SDK</th></tr></thead>
<tbody>
<tr><td>Contenu</td><td>Le CLR et la BCL : de quoi <strong>exécuter</strong> une application</td><td>Le runtime + le compilateur, la CLI <code>dotnet</code>, les templates : de quoi <strong>développer</strong></td></tr>
<tr><td>Qui l'installe</td><td>Un serveur de production</td><td>Ton poste de développeur, la CI</td></tr>
<tr><td>Variantes</td><td>.NET Runtime, ASP.NET Core Runtime, Desktop Runtime</td><td>Une seule, versionnée (ex. 10.0.1xx)</td></tr>
</tbody>
</table>
<p>Sur ton poste, installe le <strong>SDK .NET 10</strong>. Plusieurs SDK et runtimes cohabitent sans problème sur la même machine.</p>

<h3>Ce qu'on construit avec .NET</h3>
<table>
<thead><tr><th>Type d'application</th><th>Technologie</th></tr></thead>
<tbody>
<tr><td>APIs REST, back-ends</td><td>ASP.NET Core (Minimal APIs, controllers)</td></tr>
<tr><td>Sites web rendus côté serveur</td><td>ASP.NET Core MVC, Razor Pages, Blazor</td></tr>
<tr><td>Accès aux bases de données</td><td>ADO.NET, Entity Framework Core, Dapper</td></tr>
<tr><td>Services en arrière-plan</td><td>Worker Service (<code>BackgroundService</code>)</td></tr>
<tr><td>Desktop Windows</td><td>WPF, WinForms, WinUI</td></tr>
<tr><td>Mobile et desktop multiplateforme</td><td>.NET MAUI</td></tr>
<tr><td>Jeux</td><td>Unity (C#)</td></tr>
</tbody>
</table>
<p>Ce parcours se concentre sur la première moitié du tableau : APIs, ADO.NET et EF Core.</p>

<h3>Les outils</h3>
<ul>
<li><strong>Visual Studio 2026 Community</strong> (Windows, gratuit) : l'IDE le plus complet, excellent débogueur. Choix recommandé sur Windows.</li>
<li><strong>JetBrains Rider</strong> (gratuit pour un usage non commercial) : très apprécié, multiplateforme.</li>
<li><strong>VS Code + extension C# Dev Kit</strong> : léger et familier si tu viens d'Angular, suffisant pour apprendre.</li>
</ul>
<p>Pour installer le SDK sous Windows : <code>winget install Microsoft.DotNet.SDK.10</code>, ou l'installeur sur dot.net. Vérifie ensuite avec <code>dotnet --info</code>.</p>

<h3>Comparaison avec Node.js et TypeScript</h3>
<table>
<thead><tr><th>Node.js / TypeScript</th><th>.NET / C#</th></tr></thead>
<tbody>
<tr><td>V8 (moteur d'exécution)</td><td>CLR + JIT</td></tr>
<tr><td><code>tsc</code> (compilateur TS → JS)</td><td>Roslyn (compilateur C# → IL)</td></tr>
<tr><td>Types effacés à l'exécution</td><td>Types <strong>conservés</strong> à l'exécution (métadonnées, réflexion)</td></tr>
<tr><td>npm, <code>package.json</code></td><td>NuGet, fichier <code>.csproj</code></td></tr>
<tr><td><code>node_modules</code> par projet</td><td>Cache global <code>~/.nuget/packages</code></td></tr>
<tr><td>Un fil d'exécution + event loop</td><td>Vrai multithreading + <code>async</code>/<code>await</code></td></tr>
<tr><td>Bibliothèque standard réduite</td><td>BCL très complète</td></tr>
<tr><td><code>npm run build</code></td><td><code>dotnet build</code></td></tr>
</tbody>
</table>
<p>La différence la plus importante : en TypeScript, les types disparaissent après compilation. En C#, ils existent toujours à l'exécution. Un <code>int</code> ne peut jamais contenir une chaîne, même par erreur. C'est une sécurité très forte, que tu apprécieras vite.</p>

<h3>Pièges courants</h3>
<ul>
<li>Suivre un tutoriel .NET Framework (ASP.NET MVC 5, <code>web.config</code>, <code>Global.asax</code>) en pensant apprendre le .NET moderne. Vérifie toujours la date et la version.</li>
<li>Installer seulement le runtime puis ne pas comprendre pourquoi <code>dotnet new</code> ne marche pas.</li>
<li>Confondre la version du SDK (10.0.100) et celle du runtime (10.0.0).</li>
<li>Croire que C# est « lent parce que compilé deux fois » : le JIT produit du code natif optimisé, et ASP.NET Core figure parmi les frameworks web les plus rapides.</li>
</ul>

<div class="note">En entretien, on te demandera souvent d'expliquer la différence entre .NET Framework et .NET, ou ce que fait le CLR. Une bonne réponse cite le chemin C# → IL → JIT → code natif, le garbage collector, et le fait que .NET Framework ne reçoit plus que des correctifs de sécurité. En mission, beaucoup d'entreprises ont encore des applications .NET Framework 4.8 à maintenir ou à migrer : savoir les reconnaître au premier coup d'œil (<code>net48</code>, <code>packages.config</code>, <code>web.config</code>) est un vrai atout.</div>
`,
  examples: [
    {
      title: "Installer le SDK et créer ta première application",
      code: `# Installer le SDK .NET 10 (Windows)
winget install Microsoft.DotNet.SDK.10

# Vérifier l'installation
dotnet --info
dotnet --list-sdks
dotnet --list-runtimes

# Créer, compiler et lancer une application console
dotnet new console -n Hello
cd Hello
dotnet run`,
      explain: "<code>dotnet --list-sdks</code> affiche tous les SDK installés : plusieurs versions cohabitent sans problème. <code>dotnet run</code> compile puis exécute le projet du dossier courant."
    },
    {
      title: "Afficher des informations sur le runtime",
      code: `using System.Runtime.InteropServices;

// Program.cs : instructions de premier niveau (pas besoin de classe Program ni de Main)
Console.WriteLine($"Runtime     : {RuntimeInformation.FrameworkDescription}");
Console.WriteLine($"Version CLR : {Environment.Version}");
Console.WriteLine($"Système     : {RuntimeInformation.OSDescription}");
Console.WriteLine($"Processeur  : {RuntimeInformation.ProcessArchitecture}, {Environment.ProcessorCount} coeurs");
Console.WriteLine($"64 bits     : {Environment.Is64BitProcess}");

// Où se trouve la BCL sur le disque ?
Console.WriteLine($"BCL         : {typeof(string).Assembly.Location}");`,
      explain: "<code>typeof(string).Assembly.Location</code> pointe vers <code>System.Private.CoreLib.dll</code>, le coeur de la BCL, installé avec le runtime."
    },
    {
      title: "Le IL généré pour une méthode simple",
      code: `// Code C#
static int Add(int a, int b) => a + b;

// IL produit par Roslyn en Release (tel qu'affiché par ILSpy ou sharplab.io)
.method private hidebysig static int32 Add(int32 a, int32 b) cil managed
{
    .maxstack 8
    IL_0000: ldarg.0    // empile le premier argument
    IL_0001: ldarg.1    // empile le second argument
    IL_0002: add        // dépile les deux, empile la somme
    IL_0003: ret        // retourne le sommet de la pile
}`,
      explain: "L'IL est un langage à pile, indépendant du processeur. Le JIT le traduit en instructions x64 ou ARM64 au premier appel. Colle ton propre code sur sharplab.io pour voir l'IL et le code machine."
    },
    {
      title: "Les mots-clés C# sont des alias du CTS",
      code: `int a = 42;
Int32 b = a;               // exactement le même type
Console.WriteLine(typeof(int) == typeof(Int32));   // True
Console.WriteLine(typeof(int).FullName);           // System.Int32
Console.WriteLine(typeof(string).FullName);        // System.String

// Les types sont conservés à l'exécution, contrairement à TypeScript
object box = a;
Console.WriteLine(box.GetType().Name);             // Int32
Console.WriteLine(box is int);                     // True
Console.WriteLine(box is string);                  // False`,
      explain: "En TypeScript, <code>typeof</code> à l'exécution ne connaît que quelques catégories (\"number\", \"string\"…). En C#, chaque objet connaît son type exact grâce aux métadonnées."
    },
    {
      title: "Inspecter une assembly",
      code: `using System.Reflection;

var assembly = Assembly.GetExecutingAssembly();
AssemblyName name = assembly.GetName();

Console.WriteLine($"Nom     : {name.Name}");
Console.WriteLine($"Version : {name.Version}");
Console.WriteLine("Assemblies référencées :");
foreach (AssemblyName reference in assembly.GetReferencedAssemblies())
{
    Console.WriteLine($"  - {reference.Name} {reference.Version}");
}`,
      explain: "Le manifeste de l'assembly liste ses dépendances. C'est ce que le CLR lit au démarrage pour charger les bons fichiers."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Carte d'identité de ta machine",
      prompt: "<p>Crée une application console <code>MachineInfo</code> qui affiche : la description du runtime, le système d'exploitation, l'architecture du processeur, le nombre de coeurs et le nom de la machine (<code>Environment.MachineName</code>). Lance-la avec <code>dotnet run</code>.</p>",
      hint: "<p>Ajoute <code>using System.Runtime.InteropServices;</code> pour accéder à <code>RuntimeInformation</code>.</p>",
      solution: `// dotnet new console -n MachineInfo && cd MachineInfo
using System.Runtime.InteropServices;

Console.WriteLine("=== Carte d'identité ===");
Console.WriteLine($"Machine     : {Environment.MachineName}");
Console.WriteLine($"Runtime     : {RuntimeInformation.FrameworkDescription}");
Console.WriteLine($"Système     : {RuntimeInformation.OSDescription}");
Console.WriteLine($"Architecture: {RuntimeInformation.ProcessArchitecture}");
Console.WriteLine($"Coeurs      : {Environment.ProcessorCount}");`
    },
    {
      level: "moyen",
      title: "Table des alias C# et des types CTS",
      prompt: "<p>Affiche un tableau aligné avec, pour <code>int</code>, <code>long</code>, <code>short</code>, <code>byte</code>, <code>double</code>, <code>float</code>, <code>decimal</code>, <code>bool</code>, <code>char</code> : le mot-clé C#, le nom complet du type CTS et sa taille en octets. Ajoute ensuite <code>string</code> et <code>object</code>, qui n'ont pas de taille fixe.</p>",
      hint: "<p>Utilise <code>typeof(int).FullName</code> et l'opérateur <code>sizeof(int)</code>. L'alignement se fait avec <code>{valeur,-10}</code> dans une chaîne interpolée.</p>",
      solution: `Console.WriteLine($"{"C#",-10}{"CTS",-18}{"Octets",6}");
Console.WriteLine(new string('-', 34));

Print("int", typeof(int), sizeof(int));
Print("long", typeof(long), sizeof(long));
Print("short", typeof(short), sizeof(short));
Print("byte", typeof(byte), sizeof(byte));
Print("double", typeof(double), sizeof(double));
Print("float", typeof(float), sizeof(float));
Print("decimal", typeof(decimal), sizeof(decimal));
Print("bool", typeof(bool), sizeof(bool));
Print("char", typeof(char), sizeof(char));
Print("string", typeof(string), null);   // type référence : taille variable
Print("object", typeof(object), null);

static void Print(string keyword, Type type, int? size) =>
    Console.WriteLine($"{keyword,-10}{type.FullName,-18}{(size?.ToString() ?? "variable"),6}");`
    },
    {
      level: "difficile",
      title: "Debug, Release et JIT",
      prompt: "<p>Écris un programme qui additionne les entiers de 0 à 500 millions dans une boucle et mesure le temps avec <code>System.Diagnostics.Stopwatch</code>. Répète la mesure 5 fois. Lance-le avec <code>dotnet run</code> (Debug) puis avec <code>dotnet run -c Release</code>. Note les temps et explique dans un commentaire : pourquoi Release est plus rapide, et pourquoi la première mesure peut être plus lente que les suivantes.</p>",
      hint: "<p>Utilise un <code>long</code> pour la somme. Pense à la compilation par paliers (<em>tiered compilation</em>) du JIT et aux optimisations désactivées en Debug pour faciliter le débogage.</p>",
      solution: `using System.Diagnostics;

for (int run = 1; run <= 5; run++)
{
    var watch = Stopwatch.StartNew();
    long sum = SumUpTo(500_000_000);
    watch.Stop();
    Console.WriteLine($"Essai {run} : {watch.ElapsedMilliseconds} ms (somme = {sum})");
}

static long SumUpTo(int max)
{
    long sum = 0;
    for (int i = 0; i < max; i++)
        sum += i;
    return sum;
}

// Explications :
// - En Debug, Roslyn émet un IL non optimisé et le JIT désactive ses optimisations
//   pour que le débogueur puisse inspecter chaque variable. Release est donc
//   souvent 2 à 5 fois plus rapide.
// - Le premier essai peut être plus lent : le JIT compile d'abord une version
//   rapide à produire (tier 0). La méthode étant appelée souvent et contenant une
//   boucle chaude, le runtime la recompile en version optimisée (tier 1, avec
//   l'OSR, "on-stack replacement", pour les boucles longues).
// - Règle : on ne mesure JAMAIS les performances en Debug. Pour des mesures
//   sérieuses, on utilise BenchmarkDotNet (vu plus loin dans le parcours).`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 0 : installation.</strong></p>
<ol>
<li>Installe le SDK .NET 10 et ton éditeur (Visual Studio 2026 Community, Rider ou VS Code + C# Dev Kit).</li>
<li>Crée un dossier <code>Library</code>, puis une solution et un premier projet console :
<code>dotnet new sln -n Library</code>, <code>dotnet new console -n Library.Console</code>, <code>dotnet sln add Library.Console</code>.</li>
<li>Dans <code>Program.cs</code>, affiche un écran d'accueil « Bibliothèque v0.1 » suivi de la version du runtime (<code>RuntimeInformation.FrameworkDescription</code>).</li>
<li>Ouvre le <code>.dll</code> produit dans <code>bin/Debug/net10.0</code> avec ILSpy (ou colle ton code sur sharplab.io) et regarde l'IL de ta méthode d'affichage.</li>
<li>Initialise un dépôt git et fais ton premier commit (ajoute un <code>.gitignore</code> avec <code>dotnet new gitignore</code>).</li>
</ol>`,
  resources: [
    { label: "Introduction à .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/introduction" },
    { label: "Vue d'ensemble du CLR", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/clr" },
    { label: "Qu'est-ce que le code managé ?", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/managed-code" },
    { label: "Installer .NET sur Windows", url: "https://learn.microsoft.com/fr-fr/dotnet/core/install/windows" }
  ]
});

// ───────────────────────────── f-projects ─────────────────────────────
window.COURSE.push({
  key: "f-projects",
  title: "Projets, solutions, NuGet et débogage",
  summary: "Maîtriser la CLI dotnet, lire un .csproj, organiser une solution multi-projets, gérer les paquets NuGet et déboguer efficacement.",
  objectives: [
    "Utiliser les commandes dotnet du quotidien (new, build, run, watch, test, publish, add)",
    "Lire et modifier un fichier .csproj SDK-style",
    "Organiser une solution en plusieurs projets qui se référencent",
    "Gérer les paquets NuGet et centraliser la configuration avec Directory.Build.props",
    "Déboguer avec points d'arrêt, espions, pile d'appels et points d'arrêt conditionnels"
  ],
  lesson: `
<h3>Solution, projet, assembly : qui contient quoi</h3>
<p>Trois niveaux à bien distinguer :</p>
<ul>
<li>Un <strong>projet</strong> (<code>.csproj</code>) est un ensemble de fichiers <code>.cs</code> compilés ensemble. Il produit <strong>une assembly</strong> (<code>.dll</code>). C'est l'équivalent d'un paquet avec son <code>package.json</code>.</li>
<li>Une <strong>solution</strong> (<code>.sln</code> ou le nouveau <code>.slnx</code>) regroupe plusieurs projets pour les ouvrir, compiler et tester ensemble. C'est l'équivalent d'un monorepo, ou d'un workspace Angular qui contient plusieurs applications et bibliothèques.</li>
<li>Un projet peut <strong>référencer</strong> un autre projet (référence de projet) ou un paquet NuGet (référence de paquet).</li>
</ul>
<p>Une organisation classique : un projet <code>Domain</code> (bibliothèque de classes avec la logique métier), un projet <code>Api</code> ou <code>Console</code> (le point d'entrée), et un projet <code>Tests</code>. Le point d'entrée et les tests référencent <code>Domain</code>, jamais l'inverse.</p>

<h3>La CLI dotnet : les commandes du quotidien</h3>
<table>
<thead><tr><th>Commande</th><th>Rôle</th><th>Équivalent npm / Angular</th></tr></thead>
<tbody>
<tr><td><code>dotnet new &lt;template&gt;</code></td><td>Crée un projet ou un fichier à partir d'un modèle</td><td><code>ng new</code>, <code>ng generate</code></td></tr>
<tr><td><code>dotnet restore</code></td><td>Télécharge les paquets NuGet (fait automatiquement par build)</td><td><code>npm install</code></td></tr>
<tr><td><code>dotnet build</code></td><td>Compile la solution ou le projet</td><td><code>npm run build</code></td></tr>
<tr><td><code>dotnet run</code></td><td>Compile et lance le projet</td><td><code>npm start</code></td></tr>
<tr><td><code>dotnet watch</code></td><td>Relance (ou recharge à chaud) à chaque modification</td><td><code>ng serve</code></td></tr>
<tr><td><code>dotnet test</code></td><td>Lance les tests</td><td><code>ng test</code></td></tr>
<tr><td><code>dotnet publish -c Release</code></td><td>Prépare les fichiers à déployer</td><td><code>ng build --configuration production</code></td></tr>
<tr><td><code>dotnet add package X</code></td><td>Ajoute un paquet NuGet</td><td><code>npm install X</code></td></tr>
<tr><td><code>dotnet add reference ../Y</code></td><td>Ajoute une référence vers un autre projet</td><td>chemin local dans <code>package.json</code></td></tr>
<tr><td><code>dotnet sln add X</code></td><td>Ajoute un projet à la solution</td><td>entrée dans <code>angular.json</code></td></tr>
<tr><td><code>dotnet list package --outdated</code></td><td>Liste les paquets à mettre à jour</td><td><code>npm outdated</code></td></tr>
</tbody>
</table>

<h3>Les templates</h3>
<p><code>dotnet new list</code> affiche les modèles installés. Ceux que tu utiliseras le plus : <code>console</code>, <code>classlib</code> (bibliothèque de classes), <code>xunit</code> (projet de tests), <code>webapi</code> (API ASP.NET Core), <code>web</code> (application web vide), <code>worker</code> (service en arrière-plan), <code>sln</code>, <code>gitignore</code>, <code>editorconfig</code> et <code>globaljson</code>. Les options importantes : <code>-n</code> (nom), <code>-o</code> (dossier de sortie) et <code>-f</code> (framework cible).</p>
<p>Depuis .NET 10, <code>dotnet new sln</code> crée par défaut une solution au format <strong>.slnx</strong> : un fichier XML court et lisible, qui remplace l'ancien format <code>.sln</code> verbeux et plein de GUID. Visual Studio, Rider et la CLI le comprennent.</p>

<h3>Anatomie d'un .csproj</h3>
<p>Le <code>.csproj</code> moderne (dit « SDK-style ») est très court, car le SDK fournit des valeurs par défaut. Tous les fichiers <code>.cs</code> du dossier sont inclus automatiquement : tu n'as pas à les lister.</p>
<pre><code>&lt;Project Sdk="Microsoft.NET.Sdk"&gt;
  &lt;PropertyGroup&gt;
    &lt;OutputType&gt;Exe&lt;/OutputType&gt;
    &lt;TargetFramework&gt;net10.0&lt;/TargetFramework&gt;
    &lt;Nullable&gt;enable&lt;/Nullable&gt;
    &lt;ImplicitUsings&gt;enable&lt;/ImplicitUsings&gt;
  &lt;/PropertyGroup&gt;
  &lt;ItemGroup&gt;
    &lt;PackageReference Include="Humanizer" Version="2.14.1" /&gt;
    &lt;ProjectReference Include="..\\Library.Domain\\Library.Domain.csproj" /&gt;
  &lt;/ItemGroup&gt;
&lt;/Project&gt;</code></pre>
<ul>
<li><code>Sdk="Microsoft.NET.Sdk"</code> : le type de projet. Une API utilise <code>Microsoft.NET.Sdk.Web</code>, qui ajoute ASP.NET Core.</li>
<li><code>OutputType</code> : <code>Exe</code> pour un programme, absent (donc bibliothèque) pour une <code>classlib</code>.</li>
<li><code>TargetFramework</code> : la version de .NET ciblée (<code>net10.0</code>).</li>
<li><code>Nullable</code> : active les avertissements sur les références nulles. Toujours à <code>enable</code>.</li>
<li><code>ImplicitUsings</code> : ajoute automatiquement les <code>using</code> courants (<code>System</code>, <code>System.Linq</code>, <code>System.Collections.Generic</code>…).</li>
<li><code>PackageReference</code> : une dépendance NuGet. <code>ProjectReference</code> : une dépendance vers un autre projet de la solution.</li>
</ul>

<h3>NuGet en détail</h3>
<p><strong>NuGet</strong> est le gestionnaire de paquets de .NET, et <strong>nuget.org</strong> son registre public (l'équivalent de npmjs.com). Quelques différences avec npm :</p>
<ul>
<li>Les versions sont en général <strong>exactes</strong> (<code>Version="2.14.1"</code>), pas des plages <code>^2.14.1</code>. Les montées de version sont donc explicites.</li>
<li>Les paquets sont stockés dans un <strong>cache global</strong> (<code>%USERPROFILE%\\.nuget\\packages</code>), pas dans un <code>node_modules</code> par projet.</li>
<li>Le fichier <code>packages.lock.json</code> (l'équivalent de <code>package-lock.json</code>) est optionnel : active-le avec <code>&lt;RestorePackagesWithLockFile&gt;true&lt;/RestorePackagesWithLockFile&gt;</code> pour des builds reproductibles en CI.</li>
</ul>
<p>Pour centraliser la configuration de tous les projets d'une solution, place à la racine un fichier <strong>Directory.Build.props</strong> : ses propriétés s'appliquent à chaque <code>.csproj</code> situé en dessous. On y met <code>TargetFramework</code>, <code>Nullable</code>, <code>TreatWarningsAsErrors</code>… Le <strong>Central Package Management</strong> va plus loin : un fichier <code>Directory.Packages.props</code> fixe la version de chaque paquet pour toute la solution, et les <code>.csproj</code> ne contiennent plus que le nom du paquet. Fini les versions différentes d'un même paquet d'un projet à l'autre.</p>

<h3>Debug et Release</h3>
<p>Un projet se compile dans une <strong>configuration</strong>. <strong>Debug</strong> (par défaut) n'optimise pas le code et génère tous les symboles de débogage : c'est pour développer. <strong>Release</strong> (<code>-c Release</code>) optimise le code : c'est pour la production et pour mesurer les performances. Les fichiers sont produits dans <code>bin/Debug/net10.0</code> ou <code>bin/Release/net10.0</code>, et les fichiers intermédiaires dans <code>obj/</code>. Les dossiers <code>bin</code> et <code>obj</code> ne se commitent jamais.</p>
<p>Le symbole <code>DEBUG</code> est défini en Debug : <code>#if DEBUG … #endif</code> permet d'inclure du code seulement dans cette configuration. À utiliser avec parcimonie.</p>

<h3>global.json : fixer la version du SDK</h3>
<p>Si plusieurs SDK sont installés, la CLI prend le plus récent. Un fichier <code>global.json</code> à la racine du dépôt fixe la version à utiliser, pour que toute l'équipe et la CI compilent avec le même SDK. Crée-le avec <code>dotnet new globaljson --sdk-version 10.0.100</code>. La propriété <code>rollForward</code> indique jusqu'où la CLI peut monter si la version exacte manque.</p>

<h3>Le débogueur</h3>
<p>Un développeur senior débogue avec le débogueur, pas avec des <code>Console.WriteLine</code> partout. Les raccourcis de Visual Studio (identiques dans VS Code avec C# Dev Kit) :</p>
<table>
<thead><tr><th>Action</th><th>Raccourci</th></tr></thead>
<tbody>
<tr><td>Lancer avec le débogueur</td><td>F5</td></tr>
<tr><td>Poser ou retirer un point d'arrêt</td><td>F9 (ou clic dans la marge)</td></tr>
<tr><td>Pas à pas principal (sans entrer dans la méthode)</td><td>F10</td></tr>
<tr><td>Pas à pas détaillé (entrer dans la méthode)</td><td>F11</td></tr>
<tr><td>Sortir de la méthode</td><td>Maj+F11</td></tr>
<tr><td>Continuer jusqu'au prochain point d'arrêt</td><td>F5</td></tr>
</tbody>
</table>
<p>Une fois arrêté : survole une variable pour voir sa valeur, ajoute-la dans la fenêtre <strong>Espion</strong> (Watch), regarde la <strong>pile des appels</strong> (Call Stack) pour savoir qui a appelé la méthode courante, et utilise la fenêtre <strong>Exécution</strong> (Immediate) pour évaluer une expression. Un clic droit sur un point d'arrêt permet d'ajouter une <strong>condition</strong> (<code>i == 500</code>) ou un <strong>point de trace</strong> qui écrit un message sans arrêter le programme. Dans les paramètres d'exceptions, coche « arrêter quand l'exception est levée » pour t'arrêter là où elle naît, et pas là où elle est attrapée.</p>

<h3>Lire une erreur de compilation</h3>
<p>Chaque message du compilateur a un code : <code>CS0103</code> (nom introuvable, souvent un <code>using</code> manquant ou une faute de frappe), <code>CS0246</code> (type introuvable, souvent une référence de projet ou de paquet manquante), <code>CS1061</code> (membre inexistant sur ce type), <code>CS8618</code> (propriété non nullable non initialisée). Le format est toujours le même : <code>Fichier.cs(12,5): error CS0103: …</code>, soit le fichier, la ligne, la colonne, la gravité et le code. Lis toujours la <strong>première</strong> erreur en premier : les suivantes en découlent souvent. Les avertissements (<code>warning</code>) n'empêchent pas la compilation, mais ils signalent presque toujours un vrai problème, notamment les avertissements de nullabilité. C'est pour cela qu'on active <code>TreatWarningsAsErrors</code>. Recherche le code sur learn.microsoft.com : chaque erreur a une page avec des exemples et la correction.</p>

<h3>Pièges courants</h3>
<ul>
<li>Commiter <code>bin/</code> et <code>obj/</code> : utilise <code>dotnet new gitignore</code>.</li>
<li>Créer une référence circulaire (A référence B qui référence A) : la compilation échoue. Repense le découpage.</li>
<li>Avoir des versions différentes d'un même paquet selon les projets, ce qui crée des conflits à l'exécution.</li>
<li>Ajouter un paquet NuGet pour une fonctionnalité que la BCL fournit déjà (JSON, HTTP…).</li>
<li>Mesurer des performances ou livrer en Debug.</li>
</ul>

<div class="note">Sur un vrai projet, une solution saine a un <code>Directory.Build.props</code> qui active <code>Nullable</code> et <code>TreatWarningsAsErrors</code> partout, un <code>global.json</code> qui fixe le SDK, le Central Package Management pour les versions, et un <code>.editorconfig</code> pour le style. La CI lance <code>dotnet build -c Release</code> puis <code>dotnet test</code>. Quand tu arrives sur un projet existant, ouvre ces fichiers en premier : ils t'en disent beaucoup sur la maturité de l'équipe.</div>
`,
  examples: [
    {
      title: "Créer une solution multi-projets",
      code: `# Dossier racine et solution
mkdir Shop
cd Shop
dotnet new sln -n Shop
dotnet new gitignore

# Trois projets
dotnet new classlib -n Shop.Domain
dotnet new console -n Shop.Console
dotnet new xunit -n Shop.Tests

# Ajouter les projets à la solution
dotnet sln add Shop.Domain Shop.Console Shop.Tests

# Références : la console et les tests dépendent du domaine
dotnet add Shop.Console reference Shop.Domain
dotnet add Shop.Tests reference Shop.Domain

# Tout compiler et tester
dotnet build
dotnet test`,
      explain: "Les références vont toujours vers le domaine. Le domaine ne connaît ni la console ni les tests."
    },
    {
      title: "Un .csproj de projet de tests",
      code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <!-- Dépendances NuGet : le framework de tests -->
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.14.1" />
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.1.4" />
  </ItemGroup>

  <ItemGroup>
    <!-- Dépendance vers un projet de la solution -->
    <ProjectReference Include="../Shop.Domain/Shop.Domain.csproj" />
  </ItemGroup>

</Project>`,
      explain: "Les numéros de version exacts évoluent : prends ceux que génère <code>dotnet new xunit</code> ou <code>dotnet add package</code> sur ta machine."
    },
    {
      title: "Centraliser la configuration de la solution",
      code: `<!-- Directory.Build.props, à la racine : s'applique à tous les projets -->
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
</Project>

<!-- Directory.Packages.props, à la racine : une seule version par paquet -->
<Project>
  <ItemGroup>
    <PackageVersion Include="Humanizer" Version="2.14.1" />
    <PackageVersion Include="xunit" Version="2.9.3" />
  </ItemGroup>
</Project>

<!-- Dans chaque .csproj, plus de version : -->
<!-- <PackageReference Include="Humanizer" /> -->`,
      explain: "Avec ces deux fichiers, chaque <code>.csproj</code> ne garde que ce qui lui est propre (son type, ses références)."
    },
    {
      title: "Code spécifique à Debug et assertions",
      code: `using System.Diagnostics;

int[] stock = [12, 0, 7];

for (int i = 0; i < stock.Length; i++)
{
    // Debug.Assert n'est compilé qu'en Debug : il arrête le débogueur si la condition est fausse
    Debug.Assert(stock[i] >= 0, "Le stock ne peut pas être négatif");
    Console.WriteLine($"Produit {i} : {stock[i]} en stock");
}

#if DEBUG
Console.WriteLine("Build Debug : traces détaillées activées");
#else
Console.WriteLine("Build Release");
#endif

// Pose un point d'arrêt sur la ligne du Console.WriteLine de la boucle,
// clic droit > Conditions > "stock[i] == 0" : le débogueur ne s'arrête que sur le produit en rupture.`,
      explain: "Lance une fois avec <code>dotnet run</code> et une fois avec <code>dotnet run -c Release</code> pour voir la différence."
    },
    {
      title: "Fixer la version du SDK avec global.json",
      code: `{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestFeature"
  }
}`,
      explain: "Créé avec <code>dotnet new globaljson --sdk-version 10.0.100</code>. <code>latestFeature</code> autorise un SDK 10.0.2xx si le 10.0.100 n'est pas installé, mais jamais un SDK 11."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une bibliothèque et son programme",
      prompt: "<p>Crée une solution <code>Calc</code> avec une bibliothèque <code>Calc.Core</code> contenant une classe statique <code>Calculator</code> (méthodes <code>Add</code> et <code>Multiply</code>) et une application <code>Calc.Console</code> qui l'utilise pour afficher <code>2 + 3</code> et <code>4 × 5</code>. Donne les commandes et le code.</p>",
      hint: "<p>Il faut une référence de projet de la console vers la bibliothèque, et la classe doit être <code>public</code> pour être visible depuis un autre projet.</p>",
      solution: `# Commandes
dotnet new sln -n Calc
dotnet new classlib -n Calc.Core
dotnet new console -n Calc.Console
dotnet sln add Calc.Core Calc.Console
dotnet add Calc.Console reference Calc.Core
dotnet run --project Calc.Console

// Calc.Core/Calculator.cs
namespace Calc.Core;

public static class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Multiply(int a, int b) => a * b;
}

// Calc.Console/Program.cs
using Calc.Core;

Console.WriteLine($"2 + 3 = {Calculator.Add(2, 3)}");
Console.WriteLine($"4 x 5 = {Calculator.Multiply(4, 5)}");`
    },
    {
      level: "moyen",
      title: "Utiliser un paquet NuGet",
      prompt: "<p>Dans une application console, ajoute le paquet <code>Humanizer</code> et affiche de façon lisible : une date il y a 3 heures (« 3 hours ago »), le nombre 1234 en toutes lettres, et le texte <code>\"LoanIsOverdue\"</code> transformé en phrase. Vérifie ensuite avec la CLI si tes paquets sont à jour. Quel fichier a été modifié par <code>dotnet add package</code> ?</p>",
      hint: "<p>Les méthodes d'extension s'appellent <code>Humanize()</code> et <code>ToWords()</code>, dans l'espace de noms <code>Humanizer</code>.</p>",
      solution: `# Commandes
dotnet new console -n HumanDemo
cd HumanDemo
dotnet add package Humanizer
dotnet list package --outdated

// Program.cs
using Humanizer;

DateTime threeHoursAgo = DateTime.UtcNow.AddHours(-3);
Console.WriteLine(threeHoursAgo.Humanize());      // 3 hours ago
Console.WriteLine(1234.ToWords());                // one thousand two hundred and thirty-four
Console.WriteLine("LoanIsOverdue".Humanize());    // Loan is overdue

// dotnet add package a ajouté une ligne dans HumanDemo.csproj :
// <PackageReference Include="Humanizer" Version="..." />
// Le paquet lui-même est téléchargé dans le cache global ~/.nuget/packages.`
    },
    {
      level: "difficile",
      title: "Solution configurée comme en entreprise",
      prompt: "<p>Crée une solution <code>Store</code> (domaine, console, tests) avec : un <code>global.json</code>, un <code>Directory.Build.props</code> qui active <code>Nullable</code>, <code>ImplicitUsings</code> et <code>TreatWarningsAsErrors</code> pour tous les projets, et le Central Package Management. Ajoute dans le domaine une classe <code>PriceCalculator</code> avec une méthode <code>ApplyDiscount(decimal price, int percent)</code> qui refuse un pourcentage hors de 0 à 100, et un test xUnit qui vérifie un cas nominal et le cas d'erreur. Retire ensuite <code>TargetFramework</code>, <code>Nullable</code> et <code>ImplicitUsings</code> des <code>.csproj</code> : tout doit encore compiler.</p>",
      hint: "<p>Avec le Central Package Management, chaque <code>PackageReference</code> perd son attribut <code>Version</code>, qui passe dans <code>Directory.Packages.props</code>. Pour tester une exception : <code>Assert.Throws&lt;ArgumentOutOfRangeException&gt;(...)</code>.</p>",
      solution: `# Commandes
dotnet new sln -n Store
dotnet new globaljson --sdk-version 10.0.100 --roll-forward latestFeature
dotnet new gitignore
dotnet new classlib -n Store.Domain
dotnet new console -n Store.Console
dotnet new xunit -n Store.Tests
dotnet sln add Store.Domain Store.Console Store.Tests
dotnet add Store.Console reference Store.Domain
dotnet add Store.Tests reference Store.Domain

<!-- Directory.Build.props -->
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
</Project>

<!-- Directory.Packages.props : reprends les versions générées par dotnet new xunit -->
<Project>
  <ItemGroup>
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.14.1" />
    <PackageVersion Include="xunit" Version="2.9.3" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="3.1.4" />
    <PackageVersion Include="coverlet.collector" Version="6.0.4" />
  </ItemGroup>
</Project>

<!-- Store.Tests/Store.Tests.csproj : plus de version ni de TargetFramework -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="xunit" />
    <PackageReference Include="xunit.runner.visualstudio" />
    <PackageReference Include="coverlet.collector" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../Store.Domain/Store.Domain.csproj" />
  </ItemGroup>
</Project>

// Store.Domain/PriceCalculator.cs
namespace Store.Domain;

public static class PriceCalculator
{
    public static decimal ApplyDiscount(decimal price, int percent)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(percent);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(percent, 100);
        return price - price * percent / 100m;
    }
}

// Store.Tests/PriceCalculatorTests.cs
using Store.Domain;

namespace Store.Tests;

public class PriceCalculatorTests
{
    [Fact]
    public void ApplyDiscount_20Percent_On100_Returns80()
    {
        Assert.Equal(80m, PriceCalculator.ApplyDiscount(100m, 20));
    }

    [Fact]
    public void ApplyDiscount_PercentAbove100_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => PriceCalculator.ApplyDiscount(100m, 150));
    }
}

# Vérification
dotnet build -c Release
dotnet test`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 1 : structurer la solution.</strong></p>
<ol>
<li>Dans ta solution <code>Library</code>, ajoute une bibliothèque <code>Library.Domain</code> et un projet de tests <code>Library.Tests</code> (xUnit). Référence <code>Library.Domain</code> depuis la console et depuis les tests.</li>
<li>Ajoute à la racine un <code>global.json</code> (SDK 10), un <code>Directory.Build.props</code> (<code>net10.0</code>, <code>Nullable</code>, <code>ImplicitUsings</code>, <code>TreatWarningsAsErrors</code>) et nettoie les <code>.csproj</code>.</li>
<li>Déplace (ou crée) la classe <code>Book</code> dans <code>Library.Domain</code>, avec un titre, un auteur et une année de publication. Elle doit refuser une année future.</li>
<li>Écris ton premier test : « un livre avec une année future lève une exception ».</li>
<li>Pose un point d'arrêt dans le constructeur de <code>Book</code>, lance le test en mode débogage depuis ton éditeur, et inspecte les valeurs reçues.</li>
</ol>`,
  resources: [
    { label: "Vue d'ensemble de la CLI .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tools/" },
    { label: "SDK de projet .NET (.csproj)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/project-sdk/overview" },
    { label: "Central Package Management", url: "https://learn.microsoft.com/fr-fr/nuget/consume-packages/central-package-management" },
    { label: "Vue d'ensemble de global.json", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tools/global-json" },
    { label: "Découvrir le débogueur de Visual Studio", url: "https://learn.microsoft.com/fr-fr/visualstudio/debugger/debugger-feature-tour" }
  ]
});

// ───────────────────────────── f-strings-dates ─────────────────────────────
window.COURSE.push({
  key: "f-strings-dates",
  title: "Chaînes, dates et formats",
  summary: "Manipuler les chaînes, formater nombres et dates selon la culture, et éviter les pièges classiques des dates, des fuseaux horaires et de l'argent.",
  objectives: [
    "Utiliser les méthodes principales de string et savoir quand passer à StringBuilder",
    "Formater nombres, montants et dates avec l'interpolation et la culture",
    "Comparer des chaînes correctement avec StringComparison",
    "Choisir entre DateTime, DateTimeOffset, DateOnly et TimeOnly",
    "Rendre du code dépendant de l'heure testable avec TimeProvider",
    "Utiliser decimal pour l'argent et maîtriser les arrondis"
  ],
  lesson: `
<h3>string : une chaîne immuable</h3>
<p>En C#, comme en JavaScript, une <code>string</code> est <strong>immuable</strong> : aucune méthode ne la modifie, chacune retourne une nouvelle chaîne. <code>name.ToUpper()</code> seul ne fait rien d'utile : il faut écrire <code>name = name.ToUpper();</code>. C'est un type référence, mais l'opérateur <code>==</code> compare le <strong>contenu</strong> (comme en JS). Une chaîne vide s'écrit <code>""</code> ou <code>string.Empty</code>, et <code>string.IsNullOrWhiteSpace(s)</code> teste à la fois <code>null</code>, vide et espaces.</p>
<p>Un <code>char</code> est un caractère UTF-16 entre apostrophes simples (<code>'A'</code>), alors qu'une <code>string</code> est entre guillemets doubles (<code>"A"</code>). En C#, <code>'A'</code> n'est pas une chaîne.</p>

<h3>Les méthodes à connaître</h3>
<table>
<thead><tr><th>JavaScript</th><th>C#</th><th>Remarque</th></tr></thead>
<tbody>
<tr><td><code>s.length</code></td><td><code>s.Length</code></td><td>Propriété, pas méthode</td></tr>
<tr><td><code>s.split(",")</code></td><td><code>s.Split(',')</code></td><td>Option <code>StringSplitOptions.RemoveEmptyEntries | TrimEntries</code></td></tr>
<tr><td><code>arr.join(", ")</code></td><td><code>string.Join(", ", arr)</code></td><td>Méthode statique</td></tr>
<tr><td><code>s.substring(2, 5)</code></td><td><code>s.Substring(2, 3)</code> ou <code>s[2..5]</code></td><td><code>Substring</code> prend une <strong>longueur</strong>, pas un index de fin</td></tr>
<tr><td><code>s.replace(/a/g, "b")</code></td><td><code>s.Replace("a", "b")</code></td><td>Remplace <strong>toutes</strong> les occurrences</td></tr>
<tr><td><code>s.trim()</code></td><td><code>s.Trim()</code>, <code>TrimStart()</code>, <code>TrimEnd()</code></td><td></td></tr>
<tr><td><code>s.includes("x")</code></td><td><code>s.Contains("x")</code></td><td></td></tr>
<tr><td><code>s.startsWith("x")</code></td><td><code>s.StartsWith("x")</code></td><td>Précise la comparaison (voir plus bas)</td></tr>
<tr><td><code>s.indexOf("x")</code></td><td><code>s.IndexOf("x")</code></td><td>Retourne -1 si absent</td></tr>
<tr><td><code>s.padStart(5, "0")</code></td><td><code>s.PadLeft(5, '0')</code></td><td></td></tr>
<tr><td><code>s.toUpperCase()</code></td><td><code>s.ToUpper()</code> / <code>ToUpperInvariant()</code></td><td></td></tr>
</tbody>
</table>

<h3>Interpolation et formats</h3>
<p>L'interpolation s'écrit <code>$"Bonjour {name}"</code> (là où TypeScript utilise des backticks). Après la valeur, on peut ajouter un <strong>alignement</strong> (<code>{x,10}</code> à droite sur 10 caractères, <code>{x,-10}</code> à gauche) et un <strong>format</strong> après deux-points :</p>
<table>
<thead><tr><th>Format</th><th>Exemple</th><th>Résultat (fr-FR)</th></tr></thead>
<tbody>
<tr><td><code>N2</code> (nombre, 2 décimales)</td><td><code>{1234.5:N2}</code></td><td>1 234,50</td></tr>
<tr><td><code>C</code> (monétaire)</td><td><code>{19.9m:C}</code></td><td>19,90 €</td></tr>
<tr><td><code>D5</code> (entier sur 5 chiffres)</td><td><code>{42:D5}</code></td><td>00042</td></tr>
<tr><td><code>P1</code> (pourcentage)</td><td><code>{0.256:P1}</code></td><td>25,6 %</td></tr>
<tr><td><code>X</code> (hexadécimal)</td><td><code>{255:X}</code></td><td>FF</td></tr>
<tr><td>Date personnalisée</td><td><code>{date:dd/MM/yyyy}</code></td><td>04/11/2026</td></tr>
<tr><td>Date ISO 8601</td><td><code>{date:O}</code></td><td>2026-11-04T09:30:00.0000000+01:00</td></tr>
</tbody>
</table>
<p>Attention aux formats de date : <code>MM</code> = mois, <code>mm</code> = minutes, <code>HH</code> = heures sur 24 h, <code>hh</code> = sur 12 h.</p>

<h3>Verbatim et raw string literals</h3>
<p>Dans une chaîne normale, <code>\\</code> sert à échapper (<code>\\n</code> = retour à la ligne, <code>\\"</code> = guillemet). Une chaîne <strong>verbatim</strong> <code>@"C:\\temp\\file.txt"</code> désactive les échappements : pratique pour les chemins Windows. Les <strong>raw string literals</strong> (C# 11) commencent par au moins trois guillemets <code>"""</code> : tout le contenu est pris tel quel, y compris guillemets et retours à la ligne. Idéal pour du JSON, du SQL ou du HTML. Combinées à l'interpolation avec <code>$$"""</code>, les accolades simples restent du texte et les valeurs s'écrivent <code>{{nom}}</code>.</p>

<h3>StringBuilder</h3>
<p>Chaque concaténation crée une nouvelle chaîne. Dans une boucle de 10 000 tours, <code>result += ligne;</code> crée 10 000 chaînes de plus en plus longues : c'est lent et cela charge le garbage collector. <code>StringBuilder</code> (espace de noms <code>System.Text</code>) construit le texte dans un tampon modifiable avec <code>Append</code> et <code>AppendLine</code>, puis <code>ToString()</code> à la fin. Règle simple : quelques concaténations, utilise l'interpolation ; une boucle qui construit du texte, utilise <code>StringBuilder</code>.</p>

<h3>Comparer des chaînes</h3>
<p><code>==</code> fait une comparaison <strong>ordinale</strong> (octet par octet), sensible à la casse. Pour ignorer la casse, n'écris pas <code>a.ToLower() == b.ToLower()</code> (cela crée deux chaînes, et certaines langues ont des règles surprenantes, comme le « i » turc). Utilise :</p>
<ul>
<li><code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code> pour des identifiants, des codes, des clés techniques ;</li>
<li><code>StringComparison.CurrentCulture</code> pour trier du texte affiché à un utilisateur.</li>
</ul>
<p>Pour un dictionnaire insensible à la casse : <code>new Dictionary&lt;string, int&gt;(StringComparer.OrdinalIgnoreCase)</code>.</p>

<h3>La culture</h3>
<p>Le format d'un nombre ou d'une date dépend de la <strong>culture</strong> (<code>CultureInfo</code>) : 1 234,56 € en <code>fr-FR</code>, $1,234.56 en <code>en-US</code>. Par défaut, <code>ToString()</code>, <code>Parse()</code> et l'interpolation utilisent la culture du système : le même code ne donne pas le même résultat sur ton PC et sur un serveur Linux en anglais. Deux règles :</p>
<ul>
<li>pour <strong>afficher</strong> à un humain, utilise sa culture (explicitement : <code>price.ToString("C", CultureInfo.GetCultureInfo("fr-FR"))</code>) ;</li>
<li>pour <strong>stocker ou échanger</strong> (fichiers, logs, CSV, API), utilise <code>CultureInfo.InvariantCulture</code> et des formats standard (ISO 8601 pour les dates).</li>
</ul>

<h3>Dates : quel type choisir ?</h3>
<table>
<thead><tr><th>Type</th><th>Contient</th><th>Usage</th></tr></thead>
<tbody>
<tr><td><code>DateTime</code></td><td>Date + heure, avec un <code>Kind</code> (Local, Utc, Unspecified)</td><td>Historique, très utilisé, mais ambigu sur le fuseau</td></tr>
<tr><td><code>DateTimeOffset</code></td><td>Date + heure + décalage UTC (+01:00)</td><td><strong>Un instant précis</strong> : horodatage d'une commande, d'un log</td></tr>
<tr><td><code>DateOnly</code></td><td>Une date seule</td><td>Date de naissance, date de retour d'un livre</td></tr>
<tr><td><code>TimeOnly</code></td><td>Une heure seule</td><td>Heure d'ouverture d'un magasin</td></tr>
<tr><td><code>TimeSpan</code></td><td>Une durée</td><td>2 h 30, 14 jours, différence entre deux dates</td></tr>
</tbody>
</table>
<p>Le piège principal : <code>DateTime.Now</code> donne l'heure locale <strong>du serveur</strong>. Sur un serveur cloud en UTC, ce n'est pas l'heure de Paris. Règle : <strong>stocke en UTC</strong> (<code>DateTimeOffset.UtcNow</code> ou <code>DateTime.UtcNow</code>) et convertis dans le fuseau de l'utilisateur uniquement à l'affichage, avec <code>TimeZoneInfo.FindSystemTimeZoneById("Europe/Paris")</code>. Les identifiants IANA comme « Europe/Paris » fonctionnent aussi sous Windows en .NET moderne.</p>
<p>Pour lire une date saisie, préfère <code>DateOnly.TryParseExact(texte, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)</code> : pas d'exception si la saisie est invalide, et un format sans ambiguïté (le 03/04 est-il le 3 avril ou le 4 mars ?).</p>

<h3>TimeProvider : rendre l'heure testable</h3>
<p>Un code qui appelle directement <code>DateTime.UtcNow</code> est difficile à tester : le résultat change à chaque exécution. Depuis .NET 8, la BCL fournit la classe abstraite <code>TimeProvider</code>. En production, on injecte <code>TimeProvider.System</code> ; dans les tests, une version qui retourne une date fixe. C'est exactement le principe de l'injection de dépendances, que tu verras en détail avec ASP.NET Core.</p>

<h3>Les nombres : decimal pour l'argent</h3>
<p><code>double</code> est un nombre à virgule flottante binaire, comme le <code>number</code> de JavaScript : <code>0.1 + 0.2</code> donne <code>0.30000000000000004</code>. Pour de l'argent, utilise toujours <code>decimal</code> (suffixe <code>m</code> : <code>19.90m</code>), qui est exact en base 10. Attention aussi à <code>Math.Round</code> : par défaut, il arrondit « au pair le plus proche » (<code>Math.Round(2.5)</code> donne 2). Pour l'arrondi commercial, précise <code>MidpointRounding.AwayFromZero</code>. La classe <code>Math</code> fournit aussi <code>Abs</code>, <code>Max</code>, <code>Min</code>, <code>Pow</code>, <code>Sqrt</code>, <code>Ceiling</code>, <code>Floor</code> et <code>Clamp</code>.</p>

<h3>Convertir du texte en nombre</h3>
<p>Trois façons de transformer une chaîne en nombre, à ne pas confondre :</p>
<ul>
<li><code>int.Parse("42")</code> lève une <code>FormatException</code> si le texte n'est pas un nombre. À réserver aux données dont tu es sûr.</li>
<li><code>int.TryParse(text, out int value)</code> retourne <code>false</code> sans exception. C'est le bon choix pour une saisie utilisateur ou un fichier.</li>
<li><code>Convert.ToInt32(value)</code> convertit depuis n'importe quel type et retourne 0 pour <code>null</code>, ce qui peut masquer une erreur.</li>
</ul>
<p>Toutes ces méthodes utilisent la culture courante : <code>decimal.Parse("19,90")</code> fonctionne en <code>fr-FR</code> mais échoue en <code>en-US</code>. Passe la culture en paramètre (<code>decimal.Parse(text, CultureInfo.InvariantCulture)</code>) dès que la donnée vient d'un fichier ou d'une API.</p>

<h3>Encodage : UTF-8 partout</h3>
<p>En mémoire, une <code>string</code> .NET est en UTF-16. Sur le disque et sur le réseau, utilise UTF-8 : c'est le défaut de <code>File.ReadAllText</code>, <code>File.WriteAllText</code> et d'ASP.NET Core. Si les accents s'affichent mal dans la console Windows, ajoute <code>Console.OutputEncoding = System.Text.Encoding.UTF8;</code> au début du programme.</p>

<h3>Pièges courants</h3>
<ul>
<li>Oublier de réaffecter le résultat : <code>s.Trim();</code> seul ne change rien.</li>
<li>Confondre <code>MM</code> (mois) et <code>mm</code> (minutes) dans un format de date.</li>
<li>Utiliser <code>double</code> pour des prix, puis découvrir des centimes manquants.</li>
<li>Stocker <code>DateTime.Now</code> en base : les heures deviennent fausses dès que le serveur change de fuseau, et à chaque changement d'heure.</li>
<li>Lire un fichier CSV avec <code>double.Parse</code> sur un serveur dont la culture attend une virgule décimale.</li>
</ul>

<div class="note">En production, les bugs de dates et de culture sont parmi les plus fréquents et les plus pénibles à reproduire. Les réflexes d'un senior : <code>DateTimeOffset</code> en UTC pour tout instant stocké, <code>DateOnly</code> pour les dates métier, <code>InvariantCulture</code> pour tout ce qui n'est pas affiché, <code>decimal</code> pour l'argent avec une règle d'arrondi explicite, et <code>TimeProvider</code> injecté pour que les règles métier liées au temps (retards, expirations) soient testables.</div>
`,
  examples: [
    {
      title: "Les méthodes de string en action",
      code: `string input = "  Le Petit Prince ; Antoine de Saint-Exupéry ; 1943  ";

// Découper en morceaux propres
string[] parts = input.Split(';', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
string title = parts[0];
string author = parts[1];
int year = int.Parse(parts[2]);

Console.WriteLine($"Titre  : {title}");
Console.WriteLine($"Auteur : {author.ToUpperInvariant()}");
Console.WriteLine($"Année  : {year}");

Console.WriteLine(title.Contains("Prince"));               // True
Console.WriteLine(title.StartsWith("le", StringComparison.OrdinalIgnoreCase)); // True
Console.WriteLine(title.IndexOf("Petit"));                 // 3
Console.WriteLine(title.Substring(3, 5));                  // Petit (index 3, longueur 5)
Console.WriteLine(title[3..8]);                            // Petit (index 3 à 8 exclu)
Console.WriteLine(title.Replace(" ", "-").ToLowerInvariant()); // le-petit-prince
Console.WriteLine(string.Join(" | ", parts));`,
      explain: "<code>title[3..8]</code> utilise les plages (<em>ranges</em>) de C# : de l'index 3 inclus à 8 exclu, comme <code>slice(3, 8)</code> en JavaScript."
    },
    {
      title: "Formats et culture",
      code: `using System.Globalization;

var fr = CultureInfo.GetCultureInfo("fr-FR");
var us = CultureInfo.GetCultureInfo("en-US");

decimal price = 1234.5m;
var date = new DateTime(2026, 11, 4, 9, 30, 0);

Console.WriteLine(price.ToString("C", fr));       // 1 234,50 €
Console.WriteLine(price.ToString("C", us));       // $1,234.50
Console.WriteLine(price.ToString("N2", fr));      // 1 234,50
Console.WriteLine(date.ToString("D", fr));        // mercredi 4 novembre 2026
Console.WriteLine(date.ToString("d", us));        // 11/4/2026

// Pour un fichier, un log ou une API : culture invariante
string line = string.Create(CultureInfo.InvariantCulture, $"{price};{date:yyyy-MM-dd}");
Console.WriteLine(line);                           // 1234.5;2026-11-04

// Alignement dans un tableau
Console.WriteLine($"{"Article",-12}{"Prix",10}");
Console.WriteLine($"{"Clavier",-12}{49.9m.ToString("N2", fr),10}");
Console.WriteLine($"{"Écran",-12}{219m.ToString("N2", fr),10}");`,
      explain: "<code>string.Create(CultureInfo.InvariantCulture, $\"...\")</code> applique la culture invariante à toute la chaîne interpolée."
    },
    {
      title: "StringBuilder et raw string literals",
      code: `using System.Text;

string[] titles = ["Dune", "Fondation", "Hypérion"];

// StringBuilder : construire du texte dans une boucle
var report = new StringBuilder();
report.AppendLine("=== Catalogue ===");
for (int i = 0; i < titles.Length; i++)
{
    report.AppendLine($"{i + 1:D2}. {titles[i]}");
}
report.Append($"Total : {titles.Length} livres");
Console.WriteLine(report.ToString());

// Raw string literal : JSON sans aucun échappement
string name = "Dune";
int stock = 3;
string json = $$"""
    {
      "title": "{{name}}",
      "stock": {{stock}},
      "tags": ["sf", "classique"]
    }
    """;
Console.WriteLine(json);

// Verbatim : les antislashs restent des antislashs
string path = @"C:\\data\\library.csv";
Console.WriteLine(path);`,
      explain: "Avec <code>$$\"\"\"</code>, il faut deux accolades pour insérer une valeur : les accolades simples du JSON restent du texte. L'indentation commune (alignée sur les <code>\"\"\"</code> de fin) est retirée automatiquement."
    },
    {
      title: "Dates, durées et fuseaux horaires",
      code: `DateTimeOffset nowUtc = DateTimeOffset.UtcNow;
Console.WriteLine($"UTC          : {nowUtc:O}");

// Convertir pour l'affichage dans le fuseau de l'utilisateur
TimeZoneInfo paris = TimeZoneInfo.FindSystemTimeZoneById("Europe/Paris");
DateTimeOffset nowParis = TimeZoneInfo.ConvertTime(nowUtc, paris);
Console.WriteLine($"Paris        : {nowParis:dd/MM/yyyy HH:mm} ({nowParis.Offset})");

// DateOnly et TimeOnly pour les notions métier
DateOnly borrowedOn = new(2026, 11, 4);
DateOnly dueOn = borrowedOn.AddDays(14);
TimeOnly opening = new(9, 0);
Console.WriteLine($"Emprunté le  : {borrowedOn:dd/MM/yyyy}");
Console.WriteLine($"À rendre le  : {dueOn:dd/MM/yyyy}");
Console.WriteLine($"Ouverture    : {opening:HH:mm}");

// TimeSpan : une durée
TimeSpan loanDuration = dueOn.ToDateTime(TimeOnly.MinValue) - borrowedOn.ToDateTime(TimeOnly.MinValue);
Console.WriteLine($"Durée        : {loanDuration.TotalDays} jours");

// Différence en jours entre deux DateOnly
int daysLate = new DateOnly(2026, 11, 21).DayNumber - dueOn.DayNumber;
Console.WriteLine($"Retard       : {daysLate} jours");`,
      explain: "<code>DayNumber</code> donne le nombre de jours depuis le 1er janvier de l'an 1 : la soustraction de deux <code>DayNumber</code> est le moyen le plus simple de compter des jours entre deux <code>DateOnly</code>."
    },
    {
      title: "TimeProvider : une règle métier testable",
      code: `// Le service ne lit jamais l'horloge directement : on lui donne un TimeProvider
public class LoanService(TimeProvider clock)
{
    public bool IsOverdue(DateOnly dueOn)
    {
        DateOnly today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        return today > dueOn;
    }
}

// Une horloge figée pour les tests
public class FixedTimeProvider(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now;
}

// Utilisation
// En production :
//   var service = new LoanService(TimeProvider.System);
// Dans un test :
//   var clock = new FixedTimeProvider(new DateTimeOffset(2026, 11, 20, 10, 0, 0, TimeSpan.Zero));
//   var service = new LoanService(clock);
//   Assert.True(service.IsOverdue(new DateOnly(2026, 11, 18)));
//   Assert.False(service.IsOverdue(new DateOnly(2026, 11, 25)));`,
      explain: "Le paquet <code>Microsoft.Extensions.TimeProvider.Testing</code> fournit un <code>FakeTimeProvider</code> prêt à l'emploi, qu'on peut même faire avancer dans le temps."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ticket de caisse",
      prompt: "<p>Affiche un ticket de caisse en <code>fr-FR</code> pour trois articles (nom, quantité, prix unitaire en <code>decimal</code>). Chaque ligne affiche le nom aligné à gauche sur 15 caractères, la quantité alignée à droite sur 4, le prix unitaire et le total de la ligne alignés à droite sur 12 au format monétaire. Termine par le total général.</p>",
      hint: "<p>Utilise des tableaux parallèles ou un tuple <code>(string Name, int Qty, decimal Price)</code>. Pour forcer la culture, appelle <code>ToString(\"C\", fr)</code> sur chaque montant.</p>",
      solution: `using System.Globalization;

var fr = CultureInfo.GetCultureInfo("fr-FR");
(string Name, int Qty, decimal Price)[] items =
[
    ("Café", 2, 1.80m),
    ("Croissant", 3, 1.20m),
    ("Jus d'orange", 1, 3.50m)
];

decimal total = 0m;
Console.WriteLine($"{"Article",-15}{"Qté",4}{"P.U.",12}{"Total",12}");
Console.WriteLine(new string('-', 43));
foreach (var item in items)
{
    decimal lineTotal = item.Qty * item.Price;
    total += lineTotal;
    Console.WriteLine($"{item.Name,-15}{item.Qty,4}{item.Price.ToString("C", fr),12}{lineTotal.ToString("C", fr),12}");
}
Console.WriteLine(new string('-', 43));
Console.WriteLine($"{"TOTAL",-31}{total.ToString("C", fr),12}");`
    },
    {
      level: "moyen",
      title: "Calcul de pénalité de retard",
      prompt: "<p>Demande à l'utilisateur la date de retour prévue puis la date de retour réelle, au format <code>jj/mm/aaaa</code>. Redemande tant que la saisie est invalide. Calcule le nombre de jours de retard et une pénalité de 0,25 € par jour, plafonnée à 10 €. Affiche le résultat en <code>fr-FR</code>. S'il n'y a pas de retard, affiche « Aucune pénalité ».</p>",
      hint: "<p>Écris une méthode <code>ReadDate(string label)</code> qui boucle sur <code>DateOnly.TryParseExact</code>. <code>Math.Min</code> fait le plafond.</p>",
      solution: `using System.Globalization;

var fr = CultureInfo.GetCultureInfo("fr-FR");
const decimal PenaltyPerDay = 0.25m;
const decimal MaxPenalty = 10m;

DateOnly dueOn = ReadDate("Date de retour prévue (jj/mm/aaaa) : ");
DateOnly returnedOn = ReadDate("Date de retour réelle (jj/mm/aaaa) : ");

int daysLate = returnedOn.DayNumber - dueOn.DayNumber;
if (daysLate <= 0)
{
    Console.WriteLine("Aucune pénalité");
}
else
{
    decimal penalty = Math.Min(daysLate * PenaltyPerDay, MaxPenalty);
    Console.WriteLine($"{daysLate} jour(s) de retard : pénalité de {penalty.ToString("C", fr)}");
}

static DateOnly ReadDate(string label)
{
    while (true)
    {
        Console.Write(label);
        string? text = Console.ReadLine();
        if (DateOnly.TryParseExact(text, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly date))
            return date;
        Console.WriteLine("Date invalide, recommence.");
    }
}`
    },
    {
      level: "difficile",
      title: "Compteur de mots insensible à la casse",
      prompt: "<p>À partir d'un texte (une raw string literal de quelques phrases), compte la fréquence de chaque mot sans tenir compte de la casse ni de la ponctuation (<code>. , ; : ! ? ' \"</code>). Ignore les mots de moins de 3 lettres. Affiche les 5 mots les plus fréquents, avec leur nombre d'occurrences et leur pourcentage, dans un rapport construit avec <code>StringBuilder</code>. N'utilise pas LINQ (il arrive plus tard) : boucles, <code>Dictionary</code> et <code>List.Sort</code>.</p>",
      hint: "<p>Crée le dictionnaire avec <code>StringComparer.OrdinalIgnoreCase</code>. Pour découper, <code>Split</code> accepte un tableau de séparateurs. Pour trier une <code>List&lt;KeyValuePair&lt;string, int&gt;&gt;</code> par fréquence décroissante : <code>list.Sort((a, b) =&gt; b.Value.CompareTo(a.Value));</code>.</p>",
      solution: `using System.Globalization;
using System.Text;

string text = """
    Le livre est sur la table. La table est dans la bibliothèque !
    Le lecteur prend le livre ; le livre plaît au lecteur.
    Une bibliothèque sans lecteur est une bibliothèque triste ?
    """;

char[] separators = [' ', '.', ',', ';', ':', '!', '?', '\\'', '"', '\\n', '\\r'];
var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
int totalWords = 0;

foreach (string raw in text.Split(separators, StringSplitOptions.RemoveEmptyEntries))
{
    if (raw.Length < 3)
        continue;
    totalWords++;
    // TryGetValue évite deux recherches dans le dictionnaire
    counts[raw] = counts.TryGetValue(raw, out int current) ? current + 1 : 1;
}

var ranking = new List<KeyValuePair<string, int>>(counts);
ranking.Sort((a, b) => b.Value != a.Value
    ? b.Value.CompareTo(a.Value)
    : string.Compare(a.Key, b.Key, StringComparison.OrdinalIgnoreCase));

var fr = CultureInfo.GetCultureInfo("fr-FR");
var report = new StringBuilder();
report.AppendLine($"{totalWords} mots retenus, {counts.Count} mots distincts");
report.AppendLine($"{"Mot",-15}{"Nombre",8}{"Part",10}");
for (int i = 0; i < Math.Min(5, ranking.Count); i++)
{
    var (word, count) = ranking[i];
    double share = (double)count / totalWords;
    report.AppendLine($"{word.ToLowerInvariant(),-15}{count,8}{share.ToString("P1", fr),10}");
}
Console.Write(report);`
    }
  ],
  project: `<p><strong>Bibliothèque : dates d'emprunt et pénalités.</strong></p>
<ol>
<li>Dans <code>Library.Domain</code>, ajoute une classe <code>Loan</code> avec le titre du livre, une date d'emprunt <code>BorrowedOn</code> et une date de retour prévue <code>DueOn</code> (des <code>DateOnly</code>, avec 14 jours de durée par défaut).</li>
<li>Ajoute un <code>LoanService</code> qui reçoit un <code>TimeProvider</code> et expose <code>DaysLate(Loan)</code> et <code>Penalty(Loan)</code> : 0,25 € par jour de retard, plafonné à 10 €, en <code>decimal</code>.</li>
<li>Dans la console, affiche un récapitulatif des emprunts avec <code>StringBuilder</code> : dates au format <code>dd/MM/yyyy</code>, montants au format monétaire <code>fr-FR</code>, colonnes alignées.</li>
<li>Dans <code>Library.Tests</code>, écris trois tests avec une horloge figée : pas de retard, 3 jours de retard (0,75 €), 60 jours de retard (plafond à 10 €).</li>
</ol>`,
  resources: [
    { label: "Chaînes et littéraux de chaîne", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/strings/" },
    { label: "Chaînes de format numériques standard", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/base-types/standard-numeric-format-strings" },
    { label: "Chaînes de format de date et d'heure personnalisées", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/base-types/custom-date-and-time-format-strings" },
    { label: "Choisir entre DateTime, DateOnly, DateTimeOffset, TimeSpan, TimeOnly et TimeZoneInfo", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/datetime/choosing-between-datetime" },
    { label: "Qu'est-ce que TimeProvider ?", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/datetime/timeprovider-overview" }
  ]
});
