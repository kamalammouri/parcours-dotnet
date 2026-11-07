window.COURSE = window.COURSE || [];

// =====================================================================
// ADO.NET : les bases — 1. Le moteur sous tous les outils
// =====================================================================
window.COURSE.push({
  key: "ado-intro",
  title: "ADO.NET : le moteur sous tous les outils d'accès aux données",
  summary: "Tu sauras ce qu'est ADO.NET, où il se place sous Dapper et EF Core, et tu écriras ton premier programme C# qui interroge SQL Server.",
  objectives: [
    "Situer ADO.NET par rapport à Dapper et EF Core",
    "Connaître les quatre objets de base : connexion, commande, paramètre, lecteur",
    "Installer le provider Microsoft.Data.SqlClient",
    "Exécuter une première requête depuis un programme console"
  ],
  analogy: `<p>Pense à une voiture. <strong>EF Core</strong>, c'est une voiture automatique avec GPS : tu dis où tu veux aller, elle s'occupe des vitesses. <strong>Dapper</strong>, c'est une boîte manuelle : tu choisis tes vitesses, mais la conduite reste confortable.</p>
<p><strong>ADO.NET</strong>, c'est le <strong>moteur</strong>. Les deux voitures ont le même moteur sous le capot. Tu peux conduire sans jamais ouvrir le capot, mais le jour où ça fait un bruit bizarre, le mécanicien qui connaît le moteur trouve la panne en cinq minutes.</p>`,
  lesson: `<h3>ADO.NET, c'est quoi ?</h3>
<p><strong>ADO.NET</strong> est la partie de .NET qui sait parler à une base de données. Son travail est simple : ouvrir une connexion vers la base, envoyer un texte SQL, et te rendre le résultat (un nombre, ou des lignes). Il existe depuis la toute première version de .NET et il est toujours là, au cœur de la plateforme.</p>
<p>Côté Angular, tu connais <code>HttpClient</code> : il envoie une requête HTTP et te rend une réponse. ADO.NET joue le même rôle, mais au lieu de parler HTTP à une API, il parle SQL à une base de données.</p>

<h3>Le moteur sous les autres outils</h3>
<p>Dans la suite du parcours, tu utiliseras <strong>Dapper</strong> (un petit outil qui transforme automatiquement des lignes SQL en objets) et <strong>EF Core</strong> (un ORM, c'est-à-dire un outil qui traduit tes objets C# et tes requêtes LINQ en SQL). Ils ne remplacent pas ADO.NET : ils sont <strong>construits dessus</strong>. Quand EF Core lit tes produits, il ouvre une connexion ADO.NET, crée une commande ADO.NET et lit les lignes avec un lecteur ADO.NET.</p>
<pre class="diagram">
  Ton code C#
       |
  +----+-------------+-----------------+
  |  EF Core         |  Dapper         | outils
  +----+-------------+--------+--------+
       |                      |
  +----v----------------------v--------+
  |  ADO.NET : DbConnection, DbCommand | moteur
  +----------------+-------------------+
                   |
  +----------------v-------------------+
  |  Microsoft.Data.SqlClient          | provider
  +----------------+-------------------+
                   |
             SQL Server
</pre>
<table>
<tr><th></th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr>
<tr><td>Qui écrit le SQL ?</td><td>Toi</td><td>Toi</td><td>EF Core (depuis LINQ)</td></tr>
<tr><td>Lignes vers objets</td><td>À la main</td><td>Automatique</td><td>Automatique</td></tr>
<tr><td>Quantité de code</td><td>La plus grande</td><td>Petite</td><td>La plus petite</td></tr>
<tr><td>Contrôle</td><td>Total</td><td>Très grand</td><td>Moyen</td></tr>
</table>
<p>Alors pourquoi apprendre ADO.NET si les autres outils écrivent moins de code ? Parce que tout ce que tu vas voir ici (connexion, pool, paramètres, lecture des lignes, async) existe aussi sous Dapper et EF Core. Le comprendre une fois, c'est comprendre les trois.</p>

<h3>Les quatre objets à connaître</h3>
<p>Tout le travail tient en quatre classes. Pour SQL Server, elles commencent toutes par <code>Sql</code> :</p>
<table>
<tr><th>Classe</th><th>Rôle</th><th>Comparaison</th></tr>
<tr><td><code>SqlConnection</code></td><td>Le canal ouvert vers la base</td><td>La ligne téléphonique</td></tr>
<tr><td><code>SqlCommand</code></td><td>Un texte SQL à exécuter sur cette connexion</td><td>La phrase que tu prononces</td></tr>
<tr><td><code>SqlParameter</code></td><td>Une valeur envoyée à part du SQL</td><td>Un nom épelé lettre par lettre</td></tr>
<tr><td><code>SqlDataReader</code></td><td>Le lecteur qui parcourt les lignes du résultat</td><td>La personne qui te lit la réponse</td></tr>
</table>
<p>Le scénario est toujours le même :</p>
<div class="flow"><span>Ouvrir la connexion</span><span>Créer la commande</span><span>Exécuter</span><span>Lire le résultat</span><span>Fermer</span></div>

<h3>Le provider : Microsoft.Data.SqlClient</h3>
<p>ADO.NET définit des classes générales (<code>DbConnection</code>, <code>DbCommand</code>…) dans l'espace de noms <code>System.Data.Common</code>. Chaque base de données fournit sa version concrète dans un <strong>provider</strong> (un package NuGet qui sait parler le protocole de cette base). Pour SQL Server, c'est <strong>Microsoft.Data.SqlClient</strong> :</p>
<p><code>dotnet add package Microsoft.Data.SqlClient</code></p>
<div class="tip">Tu croiseras aussi <code>System.Data.SqlClient</code> dans du vieux code. C'est l'ancien provider : il n'évolue plus. Dans un nouveau projet, prends toujours <code>Microsoft.Data.SqlClient</code>. La migration se résume souvent à changer le <code>using</code>.</div>

<h3>Les données de nos exemples</h3>
<p>Les exemples de ce chapitre travaillent sur la base <strong>OrderFlow</strong> du chapitre SQL, avec les données de départ du script <code>02-seed.sql</code> : 4 clients, 6 produits, 5 commandes, 8 lignes de commande.</p>
<pre class="diagram">
Products                       Customers
Id Name              Price Stk Id Name
1  Clavier mécanique  89.90 25 1  Alice Martin
2  Souris sans fil    39.50 80 2  Bob Durand
3  Écran 27 pouces   279.00 10 3  Chloé Bernard
4  Casque audio      149.00  0 4  David Petit
5  Câble USB-C         9.99 300
6  Webcam HD          59.90 15

Orders : 1 Alice Paid    2 Alice Pending
         3 Bob Shipped   4 Chloé Paid
         5 Bob Cancelled
</pre>
<p>Avant de commencer, relance <code>01-schema.sql</code> puis <code>02-seed.sql</code> pour repartir de ces données exactes. Les exemples s'enchaînent dans l'ordre des leçons : si tu en sautes un ou si ta base contient d'autres données, certains affichages seront différents. C'est normal, le code reste le même.</p>
<div class="note">Dans les exemples, la chaîne de connexion est écrite en dur pour rester lisible. Dans une vraie application, elle vit dans la configuration (<code>appsettings.json</code>, secrets utilisateur, variables d'environnement), jamais en dur dans le code ni dans Git. Tu verras ça en détail avec ASP.NET Core.</div>`,
  examples: [
    {
      title: "Premier contact : compter les produits",
      code: `// dotnet add package Microsoft.Data.SqlClient
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

// 1. La connexion : le tuyau vers la base
using var connection = new SqlConnection(connectionString);
connection.Open();

// 2. La commande : la phrase SQL à envoyer
using var command = new SqlCommand("SELECT COUNT(*) FROM Products", connection);

// 3. L'exécution : on récupère une seule valeur
int count = (int)command.ExecuteScalar()!;

Console.WriteLine($"Base : {connection.Database}");
Console.WriteLine($"Nombre de produits : {count}");`,
      output: `Base : OrderFlow
Nombre de produits : 6`,
      steps: [
        "<code>using Microsoft.Data.SqlClient;</code> : on importe le provider SQL Server installé avec <code>dotnet add package</code>.",
        "<code>const string connectionString = …</code> : l'adresse de la base. <code>Server</code> dit où est SQL Server, <code>Database</code> quelle base utiliser, <code>Trusted_Connection=True</code> qu'on se connecte avec son compte Windows.",
        "<code>using var connection = new SqlConnection(…)</code> : on crée l'objet connexion. Le <code>using</code> garantit qu'elle sera fermée à la fin du programme.",
        "<code>connection.Open();</code> : c'est ici que .NET contacte vraiment SQL Server. Si le serveur est introuvable, l'erreur arrive sur cette ligne.",
        "<code>new SqlCommand(\"SELECT COUNT(*) FROM Products\", connection)</code> : une commande, c'est un texte SQL plus la connexion sur laquelle l'exécuter.",
        "<code>(int)command.ExecuteScalar()!</code> : <code>ExecuteScalar</code> renvoie la première colonne de la première ligne, sous forme d'<code>object?</code>. On la convertit en <code>int</code>. Le <code>!</code> dit au compilateur « je sais que ce n'est pas null »."
      ],
      explain: "Quatre lignes utiles suffisent pour parler à SQL Server : connexion, ouverture, commande, exécution."
    },
    {
      title: "Lire plusieurs lignes avec un lecteur",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = new SqlCommand("SELECT Id, Name FROM Products ORDER BY Id", connection);

// Le lecteur avance ligne par ligne, comme un curseur
using var reader = command.ExecuteReader();
while (reader.Read())
{
    int id = reader.GetInt32(0);       // colonne 0 : Id
    string name = reader.GetString(1); // colonne 1 : Name
    Console.WriteLine($"{id} - {name}");
}`,
      output: `1 - Clavier mécanique
2 - Souris sans fil
3 - Écran 27 pouces
4 - Casque audio
5 - Câble USB-C
6 - Webcam HD`,
      steps: [
        "<code>SELECT Id, Name FROM Products ORDER BY Id</code> : on demande deux colonnes, triées par Id.",
        "<code>command.ExecuteReader()</code> : au lieu d'une seule valeur, on récupère un <code>SqlDataReader</code> qui donne accès aux lignes.",
        "<code>while (reader.Read())</code> : <code>Read()</code> passe à la ligne suivante et renvoie <code>false</code> quand il n'y en a plus.",
        "<code>reader.GetInt32(0)</code> : lit la colonne numéro 0 (la première, <code>Id</code>) comme un <code>int</code>.",
        "<code>reader.GetString(1)</code> : lit la colonne numéro 1 (<code>Name</code>) comme une <code>string</code>."
      ],
      explain: "Tu verras le lecteur en détail dans la leçon dédiée : ici, retiens juste qu'on avance avec Read() et qu'on lit chaque colonne avec la bonne méthode Get."
    },
    {
      title: "Sous le capot : les types abstraits",
      code: `using System.Data.Common;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

// On manipule les types abstraits, comme le font Dapper et EF Core
using DbConnection connection = new SqlConnection(connectionString);
connection.Open();

using DbCommand command = connection.CreateCommand();
command.CommandText = "SELECT Name FROM Customers WHERE Id = 1";

Console.WriteLine($"Connexion : {connection.GetType().Name}");
Console.WriteLine($"Commande  : {command.GetType().Name}");
Console.WriteLine($"Client 1  : {command.ExecuteScalar()}");`,
      output: `Connexion : SqlConnection
Commande  : SqlCommand
Client 1  : Alice Martin`,
      steps: [
        "<code>using DbConnection connection = new SqlConnection(…)</code> : la variable est du type général <code>DbConnection</code>, mais l'objet réel est un <code>SqlConnection</code>. C'est de l'héritage, comme tu l'as vu en POO.",
        "<code>connection.CreateCommand()</code> : la connexion fabrique elle-même une commande du bon type. C'est exactement ce que fait Dapper.",
        "<code>command.CommandText = …</code> : on donne le texte SQL après coup, au lieu de le passer au constructeur.",
        "<code>connection.GetType().Name</code> : affiche le vrai type de l'objet, <code>SqlConnection</code>.",
        "<code>command.ExecuteScalar()</code> : renvoie <code>\"Alice Martin\"</code> sous forme d'<code>object</code>, que l'interpolation affiche directement."
      ],
      explain: "Pour passer à PostgreSQL, on changerait seulement le new (NpgsqlConnection) : tout le reste du code parle à DbConnection."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter les clients",
      prompt: `<p>En t'inspirant du premier exemple, écris un programme qui affiche le nombre de clients de la table <code>Customers</code>, sous la forme « OrderFlow compte 4 clients ».</p>`,
      hint: `<p>Change seulement le texte SQL : <code>SELECT COUNT(*) FROM Customers</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = new SqlCommand("SELECT COUNT(*) FROM Customers", connection);
int count = (int)command.ExecuteScalar()!;

Console.WriteLine($"OrderFlow compte {count} clients");`
    },
    {
      level: "moyen",
      title: "Lister les clients",
      prompt: `<p>Affiche la liste des clients triés par nom, une ligne par client, sous la forme « Alice Martin (alice@example.com) ». Utilise un lecteur comme dans le deuxième exemple.</p>`,
      hint: `<p>Sélectionne <code>Name, Email</code> : ce seront les colonnes 0 et 1, toutes deux lues avec <code>GetString</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = new SqlCommand("SELECT Name, Email FROM Customers ORDER BY Name", connection);
using var reader = command.ExecuteReader();

while (reader.Read())
{
    Console.WriteLine($"{reader.GetString(0)} ({reader.GetString(1)})");
}`
    },
    {
      level: "difficile",
      title: "Une méthode qui ne connaît que DbConnection",
      prompt: `<p>Écris une fonction locale <code>int CountRows(DbConnection connection, string sql)</code> qui crée une commande avec <code>connection.CreateCommand()</code>, l'exécute et renvoie le nombre. Appelle-la trois fois pour afficher le nombre de produits, de clients et de commandes.</p>`,
      hint: `<p>La fonction ne doit jamais mentionner <code>SqlConnection</code> : seul le code principal fait le <code>new SqlConnection</code>. Pense à <code>using var command = connection.CreateCommand();</code>.</p>`,
      solution: `using System.Data.Common;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

Console.WriteLine($"Produits  : {CountRows(connection, "SELECT COUNT(*) FROM Products")}");
Console.WriteLine($"Clients   : {CountRows(connection, "SELECT COUNT(*) FROM Customers")}");
Console.WriteLine($"Commandes : {CountRows(connection, "SELECT COUNT(*) FROM Orders")}");

// Ne connaît que le type abstrait : marcherait avec une autre base
int CountRows(DbConnection db, string sql)
{
    using var command = db.CreateCommand();
    command.CommandText = sql;
    return (int)command.ExecuteScalar()!;
}`
    }
  ],
  quiz: [
    {
      q: `Quelle phrase décrit le mieux le lien entre ADO.NET et EF Core ?`,
      options: ["EF Core remplace ADO.NET, qui est obsolète", "EF Core est construit au-dessus d'ADO.NET", "Ce sont deux outils sans rapport"],
      answer: 1,
      why: `EF Core (comme Dapper) utilise en interne une connexion, des commandes et un lecteur ADO.NET. ADO.NET n'est pas obsolète : c'est le moteur commun.`
    },
    {
      q: `Quel package NuGet installer pour parler à SQL Server dans un nouveau projet ?`,
      options: ["<code>System.Data.SqlClient</code>", "<code>Microsoft.EntityFrameworkCore</code>", "<code>Microsoft.Data.SqlClient</code>"],
      answer: 2,
      why: `<code>Microsoft.Data.SqlClient</code> est le provider actuel. <code>System.Data.SqlClient</code> est l'ancien, qui n'évolue plus. EF Core est un ORM, pas le provider de base.`
    },
    {
      q: `Quel objet sert à parcourir les lignes renvoyées par un <code>SELECT</code> ?`,
      options: ["<code>SqlDataReader</code>", "<code>SqlParameter</code>", "<code>SqlConnection</code>"],
      answer: 0,
      why: `Le <code>SqlDataReader</code> avance ligne par ligne avec <code>Read()</code>. La connexion est le canal, le paramètre une valeur envoyée à la requête.`
    },
    {
      q: `Sur quelle ligne une erreur « serveur introuvable » apparaît-elle ?`,
      options: ["<code>new SqlConnection(connectionString)</code>", "<code>connection.Open()</code>", "<code>new SqlCommand(sql, connection)</code>"],
      answer: 1,
      why: `Créer l'objet <code>SqlConnection</code> ne contacte pas le serveur : c'est <code>Open()</code> qui établit vraiment la connexion. Le piège : croire que le constructeur se connecte déjà.`
    }
  ],
  project: `<p><strong>OrderFlow : brancher la console sur la base.</strong> Dans ton projet console OrderFlow (celui où tu as créé <code>Customer</code>, <code>Product</code> et <code>OrderStatus</code> au chapitre SQL), installe le provider : <code>dotnet add package Microsoft.Data.SqlClient</code>. Relance <code>01-schema.sql</code> et <code>02-seed.sql</code> pour partir des données de référence.</p>
<p>Ajoute un fichier <code>Db.cs</code> contenant <code>static class Db { public const string ConnectionString = "…"; }</code> avec la chaîne de connexion notée dans ton <code>database/README.md</code>. Dans <code>Program.cs</code>, affiche « OrderFlow : 6 produits, 4 clients » grâce à deux <code>ExecuteScalar</code>.</p>`,
  resources: [
    { label: "Vue d'ensemble d'ADO.NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/framework/data/adonet/ado-net-overview" },
    { label: "Microsoft.Data.SqlClient (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/introduction-microsoft-data-sqlclient-namespace" }
  ]
});

// =====================================================================
// ADO.NET : les bases — 2. La connexion
// =====================================================================
window.COURSE.push({
  key: "ado-connection",
  title: "Ouvrir une connexion : SqlConnection, chaîne de connexion et pool",
  summary: "Tu sauras écrire une chaîne de connexion, ouvrir et fermer une connexion proprement avec using, et expliquer le rôle du pool de connexions.",
  objectives: [
    "Lire et écrire une chaîne de connexion SQL Server",
    "Ouvrir une connexion tard et la fermer tôt avec using",
    "Comprendre le pool de connexions et pourquoi il faut toujours fermer",
    "Réagir proprement à une erreur de connexion"
  ],
  analogy: `<p>Pense aux <strong>vélos en libre-service</strong>. Fabriquer un vélo neuf à chaque trajet serait absurde : ça prendrait des heures. À la place, tu en prends un à la borne, tu roules, et tu le <strong>rends</strong> pour que le suivant le réutilise.</p>
<p>Le <strong>pool de connexions</strong> fonctionne pareil. Ouvrir une vraie connexion vers SQL Server coûte cher. .NET garde donc des connexions prêtes dans une « borne ». <code>Open()</code> en emprunte une, <code>Close()</code> la rend. Et si tu oublies de rendre ton vélo, la borne finit vide.</p>`,
  lesson: `<h3>Une connexion, c'est quoi ?</h3>
<p>Une <strong>connexion</strong> est un canal réseau ouvert entre ton programme et SQL Server. Pour l'établir, il faut trouver le serveur, échanger un chiffrement, vérifier ton identité et choisir la base. Tout ça prend du temps : quelques millisecondes en local, parfois bien plus à travers le réseau.</p>
<p>En C#, c'est la classe <code>SqlConnection</code>. Créer l'objet avec <code>new</code> ne fait rien sur le réseau : c'est <code>Open()</code> qui établit le canal.</p>

<h3>La chaîne de connexion</h3>
<p>La <strong>chaîne de connexion</strong> est un texte de la forme <code>Clé=Valeur;Clé=Valeur;…</code> qui dit à .NET où et comment se connecter. Voici les clés que tu utiliseras le plus :</p>
<table>
<tr><th>Clé</th><th>Exemple</th><th>Signification</th></tr>
<tr><td><code>Server</code></td><td><code>localhost</code></td><td>Où est SQL Server (nom, IP, <code>localhost,1433</code> avec un port)</td></tr>
<tr><td><code>Database</code></td><td><code>OrderFlow</code></td><td>La base à utiliser</td></tr>
<tr><td><code>Trusted_Connection</code></td><td><code>True</code></td><td>Connexion avec ton compte Windows, sans mot de passe</td></tr>
<tr><td><code>User Id</code> / <code>Password</code></td><td><code>sa</code> / …</td><td>Connexion avec un compte SQL (Docker, Linux, cloud)</td></tr>
<tr><td><code>TrustServerCertificate</code></td><td><code>True</code></td><td>Accepte le certificat non signé du serveur : pour le développement seulement</td></tr>
<tr><td><code>Connect Timeout</code></td><td><code>5</code></td><td>Secondes avant d'abandonner <code>Open()</code> (15 par défaut)</td></tr>
<tr><td><code>Application Name</code></td><td><code>OrderFlow.Console</code></td><td>Nom visible côté serveur, pratique pour le diagnostic</td></tr>
</table>
<p>Selon ton installation, le début change : <code>Server=(localdb)\\MSSQLLocalDB</code> pour LocalDB, ou <code>Server=localhost,1433;User Id=sa;Password=…</code> pour SQL Server dans Docker. Le reste du code ne bouge pas.</p>
<p>Pour éviter les fautes de frappe, tu peux construire la chaîne avec <code>SqlConnectionStringBuilder</code> : chaque clé devient une propriété typée, comme dans le deuxième exemple.</p>
<div class="tip">Depuis Microsoft.Data.SqlClient 4, la connexion est <strong>chiffrée par défaut</strong>. En local, SQL Server a souvent un certificat auto-signé : sans <code>TrustServerCertificate=True</code>, tu obtiens une erreur de certificat à l'ouverture. En production, on installe un vrai certificat et on retire cette option.</div>

<h3>Ouvrir tard, fermer tôt</h3>
<p>La règle d'or : ouvre la connexion <strong>juste avant</strong> d'en avoir besoin, et ferme-la <strong>dès que tu as fini</strong>. Une connexion ouverte bloque une ressource côté serveur.</p>
<p>Pour ne jamais oublier de fermer, on utilise <code>using</code>. Tu l'as vu avec les fichiers : à la fin du bloc (ou de la méthode pour <code>using var</code>), C# appelle <code>Dispose()</code>, qui ferme la connexion, même si une exception a été levée entre-temps.</p>
<div class="flow"><span>new SqlConnection</span><span>Open()</span><span>commandes</span><span>Dispose() via using</span></div>

<h3>Le pool de connexions</h3>
<p>Puisque ouvrir une vraie connexion coûte cher, .NET garde un <strong>pool</strong> : une réserve de connexions physiques déjà ouvertes. Il y a un pool par chaîne de connexion (au caractère près).</p>
<pre class="diagram">
 Ton code                     Pool (même chaîne)
 --------                     ------------------
 c1.Open()  --- emprunte ---&gt; [conn A] [conn B]
 c1.Close() --- rend -------&gt; [conn A] [conn B]
 c2.Open()  --- emprunte ---&gt; [conn A] réutilisée
                                   |
                              SQL Server
</pre>
<p>Conséquence importante : <code>Close()</code> ou <code>Dispose()</code> ne coupe pas le canal réseau, il <strong>rend</strong> la connexion au pool. Le prochain <code>Open()</code> avec la même chaîne la récupère presque instantanément. C'est pour ça qu'on peut, sans scrupule, ouvrir et fermer une connexion dans chaque méthode.</p>
<p>Par défaut, le pool contient au maximum 100 connexions (<code>Max Pool Size</code>). Si ton code oublie de fermer, les connexions restent « empruntées » et, au 101e <code>Open()</code>, ton programme attend puis échoue avec une erreur de délai d'attente.</p>

<h3>Quand la connexion échoue</h3>
<p>Serveur arrêté, mauvais nom de base, mot de passe faux : <code>Open()</code> lève une <code>SqlException</code>. Sa propriété <code>Message</code> décrit le problème et <code>Number</code> donne le code d'erreur SQL Server. Avec <code>Connect Timeout=5</code>, tu es fixé en 5 secondes au lieu de 15.</p>
<div class="note">En entreprise, la chaîne de connexion ne contient jamais de mot de passe en clair dans le code : on utilise l'authentification Windows ou Microsoft Entra, ou des secrets stockés hors du dépôt. Et on garde <strong>une seule chaîne identique</strong> pour toute l'application : deux chaînes qui diffèrent d'un espace créent deux pools séparés.</div>`,
  examples: [
    {
      title: "Ouvrir, utiliser, fermer",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
Console.WriteLine($"Avant Open  : {connection.State}");

connection.Open();
Console.WriteLine($"Après Open  : {connection.State}");
Console.WriteLine($"Base        : {connection.Database}");
Console.WriteLine($"Serveur     : {connection.DataSource}");

connection.Close();
Console.WriteLine($"Après Close : {connection.State}");`,
      output: `Avant Open  : Closed
Après Open  : Open
Base        : OrderFlow
Serveur     : localhost
Après Close : Closed`,
      steps: [
        "<code>using var connection = new SqlConnection(…)</code> : l'objet existe, mais aucun contact avec le serveur pour l'instant.",
        "<code>connection.State</code> : une énumération qui indique l'état. Avant <code>Open()</code>, elle vaut <code>Closed</code>.",
        "<code>connection.Open();</code> : la connexion est empruntée au pool (ou créée si le pool est vide). L'état passe à <code>Open</code>.",
        "<code>connection.Database</code> et <code>connection.DataSource</code> : la base et le serveur réellement utilisés, lus depuis la chaîne.",
        "<code>connection.Close();</code> : la connexion retourne au pool. Le <code>using</code> appellerait <code>Dispose()</code> de toute façon à la fin, appeler les deux ne pose aucun problème."
      ]
    },
    {
      title: "Construire la chaîne avec SqlConnectionStringBuilder",
      code: `using Microsoft.Data.SqlClient;

// Le builder évite les fautes de frappe dans la chaîne
var builder = new SqlConnectionStringBuilder
{
    DataSource = "localhost",
    InitialCatalog = "OrderFlow",
    IntegratedSecurity = true,
    TrustServerCertificate = true,
    ConnectTimeout = 5,
    ApplicationName = "OrderFlow.Console"
};

Console.WriteLine(builder.ConnectionString);

using var connection = new SqlConnection(builder.ConnectionString);
connection.Open();
Console.WriteLine($"Connecté à {connection.Database}");`,
      output: `Data Source=localhost;Initial Catalog=OrderFlow;Integrated Security=True;Connect Timeout=5;Trust Server Certificate=True;Application Name=OrderFlow.Console
Connecté à OrderFlow`,
      steps: [
        "<code>new SqlConnectionStringBuilder { … }</code> : chaque clé de la chaîne devient une propriété typée. Une faute de frappe devient une erreur de compilation.",
        "<code>DataSource</code> et <code>InitialCatalog</code> : les noms officiels de <code>Server</code> et <code>Database</code>. Les deux écritures sont acceptées dans une chaîne.",
        "<code>IntegratedSecurity = true</code> : l'équivalent de <code>Trusted_Connection=True</code>, l'authentification Windows.",
        "<code>ConnectTimeout = 5</code> : <code>Open()</code> abandonnera au bout de 5 secondes si le serveur ne répond pas.",
        "<code>builder.ConnectionString</code> : le builder produit la chaîne finale, avec les noms de clés officiels. C'est elle qu'on passe à <code>SqlConnection</code>."
      ],
      explain: "Le builder sert aussi à lire une chaîne existante : new SqlConnectionStringBuilder(chaine).InitialCatalog te donne le nom de la base."
    },
    {
      title: "Le pool en action",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Guid first, second, third;

using (var c1 = new SqlConnection(connectionString))
{
    c1.Open();
    first = c1.ClientConnectionId; // identifiant de la connexion physique
} // Dispose : la connexion retourne dans le pool

using (var c2 = new SqlConnection(connectionString))
{
    c2.Open();                     // le pool ressert la même
    second = c2.ClientConnectionId;
}

using (var c3 = new SqlConnection(connectionString + ";Pooling=False"))
{
    c3.Open();                     // sans pool : nouvelle connexion physique
    third = c3.ClientConnectionId;
}

Console.WriteLine($"Avec pool, même connexion : {first == second}");
Console.WriteLine($"Sans pool, même connexion : {second == third}");`,
      output: `Avec pool, même connexion : True
Sans pool, même connexion : False`,
      steps: [
        "<code>c1.ClientConnectionId</code> : un identifiant unique (<code>Guid</code>) de la connexion <em>physique</em> vers SQL Server.",
        "<code>using (var c1 = …) { … }</code> : à la sortie du bloc, <code>Dispose()</code> rend la connexion au pool au lieu de la détruire.",
        "<code>c2.Open();</code> : nouvel objet <code>SqlConnection</code>, même chaîne : le pool lui prête la connexion physique que <code>c1</code> vient de rendre. Même identifiant.",
        "<code>connectionString + \";Pooling=False\"</code> : on désactive le pool. C'est aussi une chaîne différente, donc de toute façon un autre pool.",
        "<code>second == third</code> : <code>False</code>, car <code>c3</code> a dû ouvrir une toute nouvelle connexion physique."
      ],
      explain: "Deux objets SqlConnection différents, une seule connexion réseau : c'est tout l'intérêt du pool."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Afficher l'état",
      prompt: `<p>Écris un programme qui crée une connexion, l'ouvre, affiche « Connexion ouverte sur la base OrderFlow » en utilisant <code>connection.Database</code>, puis la laisse se fermer grâce à <code>using</code>.</p>`,
      hint: `<p><code>using var connection = new SqlConnection(connectionString);</code> puis <code>connection.Open();</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();
Console.WriteLine($"Connexion ouverte sur la base {connection.Database}");
// Le using ferme (rend au pool) la connexion à la fin du programme`
    },
    {
      level: "moyen",
      title: "Gérer un serveur introuvable",
      prompt: `<p>Construis avec <code>SqlConnectionStringBuilder</code> une chaîne qui pointe vers un serveur qui n'existe pas (<code>DataSource = "serveur-inexistant"</code>) avec <code>ConnectTimeout = 3</code>. Entoure <code>Open()</code> d'un <code>try/catch (SqlException ex)</code> et affiche « Impossible de se connecter : » suivi du numéro d'erreur <code>ex.Number</code>.</p>`,
      hint: `<p>Le programme doit afficher le message après environ 3 secondes au lieu de planter.</p>`,
      solution: `using Microsoft.Data.SqlClient;

var builder = new SqlConnectionStringBuilder
{
    DataSource = "serveur-inexistant",
    InitialCatalog = "OrderFlow",
    IntegratedSecurity = true,
    TrustServerCertificate = true,
    ConnectTimeout = 3
};

using var connection = new SqlConnection(builder.ConnectionString);
try
{
    connection.Open();
    Console.WriteLine("Connecté");
}
catch (SqlException ex)
{
    Console.WriteLine($"Impossible de se connecter : erreur {ex.Number}");
}`
    },
    {
      level: "difficile",
      title: "Mettre le pool à l'épreuve",
      prompt: `<p>Écris une boucle de 1 000 itérations qui, à chaque tour, crée une <code>SqlConnection</code> dans un <code>using</code>, l'ouvre et exécute <code>SELECT 1</code> avec <code>ExecuteScalar</code>. Mesure le temps total avec <code>System.Diagnostics.Stopwatch</code>. Relance ensuite avec <code>;Pooling=False</code> ajouté à la chaîne et compare les deux temps.</p>`,
      hint: `<p><code>var sw = Stopwatch.StartNew();</code> avant la boucle, puis <code>sw.ElapsedMilliseconds</code> après. Écris une fonction locale <code>long Measure(string cs)</code> pour éviter de dupliquer la boucle.</p>`,
      solution: `using System.Diagnostics;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Console.WriteLine($"Avec pool : {Measure(connectionString)} ms");
Console.WriteLine($"Sans pool : {Measure(connectionString + ";Pooling=False")} ms");

long Measure(string cs)
{
    var sw = Stopwatch.StartNew();
    for (int i = 0; i < 1000; i++)
    {
        using var connection = new SqlConnection(cs);
        connection.Open();
        using var command = new SqlCommand("SELECT 1", connection);
        command.ExecuteScalar();
    }
    return sw.ElapsedMilliseconds;
}
// Sans pool, chaque tour refait tout l'établissement de la connexion :
// le temps est souvent plusieurs fois plus long.`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>connection.Close()</code> quand le pool est activé (le cas par défaut) ?`,
      options: ["Il coupe la connexion réseau avec SQL Server", "Il rend la connexion physique au pool pour qu'elle soit réutilisée", "Il ne fait rien tant que le programme tourne"],
      answer: 1,
      why: `Avec le pool, fermer revient à rendre la connexion à la réserve. Le canal réseau reste ouvert et sert au prochain <code>Open()</code> avec la même chaîne.`
    },
    {
      q: `Pourquoi entourer une connexion d'un <code>using</code> ?`,
      options: ["Pour qu'elle soit fermée même si une exception est levée", "Pour ouvrir la connexion automatiquement", "Pour activer le pool de connexions"],
      answer: 0,
      why: `<code>using</code> garantit l'appel à <code>Dispose()</code>, donc la fermeture, quoi qu'il arrive. Il n'ouvre rien (il faut appeler <code>Open()</code>) et le pool est actif par défaut.`
    },
    {
      q: `Ton code ouvre des connexions sans jamais les fermer. Que finit-il par se passer ?`,
      options: ["Rien, le ramasse-miettes les ferme tout de suite", "SQL Server redémarre", "Le pool se vide et <code>Open()</code> échoue après un délai d'attente"],
      answer: 2,
      why: `Les connexions non rendues restent empruntées. Une fois les 100 connexions du pool prises, <code>Open()</code> attend puis lève une exception. Le ramasse-miettes ne passe pas « tout de suite » : c'est le piège.`
    },
    {
      q: `À quoi sert <code>TrustServerCertificate=True</code> ?`,
      options: ["À se connecter sans mot de passe", "À accepter un certificat auto-signé, typiquement en développement local", "À désactiver le chiffrement"],
      answer: 1,
      why: `La connexion reste chiffrée, mais le certificat du serveur n'est pas vérifié. Pratique en local, à éviter en production. Se connecter sans mot de passe, c'est <code>Trusted_Connection</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : vérifier la base au démarrage.</strong> Dans <code>Db.cs</code>, remplace la constante par une propriété construite avec <code>SqlConnectionStringBuilder</code> (<code>ConnectTimeout = 5</code>, <code>ApplicationName = "OrderFlow.Console"</code>). Ajoute une méthode <code>public static bool CanConnect()</code> qui ouvre une connexion dans un <code>using</code> et renvoie <code>true</code>, ou attrape la <code>SqlException</code>, affiche son message et renvoie <code>false</code>.</p>
<p>Au début de <code>Program.cs</code>, appelle <code>Db.CanConnect()</code> : si elle renvoie <code>false</code>, affiche « Base OrderFlow injoignable, vérifie que SQL Server est démarré » et quitte avec <code>return;</code>.</p>`,
  resources: [
    { label: "Syntaxe des chaînes de connexion (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/connection-string-syntax" },
    { label: "Regroupement de connexions SQL Server (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/sql-server-connection-pooling" }
  ]
});

// =====================================================================
// ADO.NET : les bases — 3. Les commandes
// =====================================================================
window.COURSE.push({
  key: "ado-command",
  title: "Exécuter une commande : ExecuteNonQuery et ExecuteScalar",
  summary: "Tu sauras exécuter un INSERT, un UPDATE ou un DELETE, savoir combien de lignes ont changé, et récupérer une valeur unique comme un total ou l'Id créé.",
  objectives: [
    "Créer une SqlCommand et changer son texte",
    "Choisir entre ExecuteNonQuery, ExecuteScalar et ExecuteReader",
    "Lire le nombre de lignes modifiées",
    "Récupérer une valeur unique et gérer null et DBNull"
  ],
  analogy: `<p>Imagine un <strong>comptoir de restaurant</strong> avec trois guichets selon ce que tu attends en retour.</p>
<p>Au premier, tu déposes une consigne (« rangez la réserve ») et on te répond seulement « c'est fait, 3 étagères rangées » : c'est <code>ExecuteNonQuery</code>. Au deuxième, tu poses une question à réponse unique (« combien de clients aujourd'hui ? ») : c'est <code>ExecuteScalar</code>. Au troisième, on te sert un plateau entier de lignes : c'est <code>ExecuteReader</code>.</p>`,
  lesson: `<h3>Une commande, c'est un texte SQL et une connexion</h3>
<p>Une <code>SqlCommand</code> contient deux choses essentielles : le texte SQL à exécuter (<code>CommandText</code>) et la connexion à utiliser (<code>Connection</code>). On peut les donner au constructeur, ou créer la commande avec <code>connection.CreateCommand()</code> puis remplir <code>CommandText</code>.</p>
<p>Une même commande peut servir plusieurs fois : il suffit de changer son <code>CommandText</code> entre deux exécutions. Pour écrire un SQL sur plusieurs lignes, utilise une <strong>raw string</strong> (chaîne brute) entre triples guillemets <code>"""</code> : pas besoin d'échapper quoi que ce soit, et ton SQL reste lisible.</p>

<h3>Trois façons d'exécuter</h3>
<p>Le choix de la méthode dépend de ce que tu attends en retour :</p>
<table>
<tr><th>Méthode</th><th>Renvoie</th><th>Pour</th></tr>
<tr><td><code>ExecuteNonQuery()</code></td><td><code>int</code> : nombre de lignes touchées</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, <code>CREATE TABLE</code>…</td></tr>
<tr><td><code>ExecuteScalar()</code></td><td><code>object?</code> : 1re colonne de la 1re ligne</td><td><code>COUNT</code>, <code>SUM</code>, <code>MAX</code>, un Id, un nom</td></tr>
<tr><td><code>ExecuteReader()</code></td><td><code>SqlDataReader</code> : toutes les lignes</td><td>Un <code>SELECT</code> qui renvoie plusieurs lignes ou colonnes</td></tr>
</table>
<div class="flow"><span>SqlCommand</span><span>NonQuery : combien ?</span><span>Scalar : une valeur</span><span>Reader : des lignes</span></div>
<p>Cette leçon couvre les deux premières. Le lecteur a sa propre leçon juste après.</p>

<h3>ExecuteNonQuery : « c'est fait, n lignes »</h3>
<p><code>ExecuteNonQuery</code> exécute l'instruction et renvoie le <strong>nombre de lignes affectées</strong>. C'est très utile pour vérifier ce qui s'est passé : un <code>UPDATE … WHERE Id = 999</code> qui renvoie 0 t'indique que la ligne n'existe pas. Aucune exception n'est levée dans ce cas : c'est à toi de tester le nombre.</p>
<p>Pour une instruction qui ne touche aucune ligne de données (un <code>CREATE TABLE</code>, par exemple), la méthode renvoie <code>-1</code>.</p>

<h3>ExecuteScalar : une seule valeur</h3>
<p><code>ExecuteScalar</code> renvoie la valeur de la <strong>première colonne de la première ligne</strong>, et ignore tout le reste. Elle renvoie un <code>object?</code> : tu dois la convertir avec un cast, par exemple <code>(int)</code> pour un <code>COUNT(*)</code> ou <code>(decimal)</code> pour une somme de prix.</p>
<p>Attention, il y a deux sortes de « vide », et elles ne se testent pas pareil :</p>
<div class="compare"><div><h4>Aucune ligne</h4><p>La requête ne renvoie rien (<code>SELECT Name … WHERE Id = 999</code>). <code>ExecuteScalar</code> renvoie <code>null</code>.</p></div><div><h4>Une ligne avec NULL</h4><p>La requête renvoie une ligne dont la valeur est <code>NULL</code> (<code>SELECT MAX(Price) …</code> sur zéro produit). <code>ExecuteScalar</code> renvoie <code>DBNull.Value</code>.</p></div></div>
<p><code>DBNull.Value</code> est l'objet qu'ADO.NET utilise pour représenter le <code>NULL</code> SQL. Ce n'est <strong>pas</strong> le <code>null</code> de C#. Teste-le avec <code>result is DBNull</code>. Un cast direct <code>(decimal)result</code> sur un <code>DBNull</code> lève une <code>InvalidCastException</code>.</p>
<div class="tip">Le type renvoyé suit le type SQL : <code>COUNT(*)</code> donne un <code>int</code>, <code>COUNT_BIG(*)</code> un <code>long</code>, <code>SUM</code> sur un <code>decimal</code> un <code>decimal</code>. Si ton cast ne correspond pas exactement, tu obtiens une <code>InvalidCastException</code>. En cas de doute, <code>Convert.ToInt32(result)</code> est plus tolérant.</div>

<h3>Récupérer l'Id d'une ligne créée</h3>
<p>Les tables OrderFlow ont des Id en <code>IDENTITY</code> : c'est SQL Server qui choisit le numéro. Pour le connaître, ajoute <code>OUTPUT INSERTED.Id</code> à ton <code>INSERT</code> : l'instruction renvoie alors une ligne avec l'Id créé, que tu lis avec <code>ExecuteScalar</code>. On peut aussi enchaîner <code>INSERT …; SELECT CAST(SCOPE_IDENTITY() AS int);</code>, mais <code>OUTPUT</code> est plus direct.</p>

<h3>Le délai d'exécution</h3>
<p>Une commande a un délai maximum, <code>CommandTimeout</code>, de <strong>30 secondes</strong> par défaut. Au-delà, ADO.NET abandonne et lève une <code>SqlException</code>. Ce délai est indépendant du <code>Connect Timeout</code> de la connexion. Augmente-le pour un gros traitement de nuit, pas pour masquer une requête lente.</p>
<div class="note">Dans cette leçon, les valeurs sont écrites directement dans le SQL parce qu'elles sont fixes. Dès qu'une valeur vient de l'extérieur (saisie, fichier, requête HTTP), on ne la colle <strong>jamais</strong> dans le texte SQL : on utilise des paramètres. C'est le sujet de la leçon sur l'injection SQL, et c'est non négociable en entreprise.</div>`,
  examples: [
    {
      title: "ExecuteNonQuery : combien de lignes modifiées ?",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

// La commande 1 est expédiée
using var command = new SqlCommand(
    "UPDATE Orders SET Status = 'Shipped' WHERE Id = 1", connection);
int rows = command.ExecuteNonQuery();
Console.WriteLine($"Commandes expédiées : {rows}");

// Même objet, nouveau texte : une commande qui n'existe pas
command.CommandText = "UPDATE Orders SET Status = 'Cancelled' WHERE Id = 999";
rows = command.ExecuteNonQuery();
Console.WriteLine($"Commandes annulées : {rows}");`,
      output: `Commandes expédiées : 1
Commandes annulées : 0`,
      steps: [
        "<code>new SqlCommand(\"UPDATE Orders …\", connection)</code> : la commande porte le texte SQL et la connexion déjà ouverte.",
        "<code>int rows = command.ExecuteNonQuery();</code> : SQL Server exécute l'<code>UPDATE</code> et renvoie le nombre de lignes modifiées : 1.",
        "<code>command.CommandText = …</code> : on réutilise le même objet commande avec un nouveau texte.",
        "<code>WHERE Id = 999</code> : aucune commande ne porte cet Id. Pas d'erreur, mais <code>ExecuteNonQuery</code> renvoie 0. C'est à toi de vérifier ce nombre.",
        "Le statut de la commande 1 est maintenant <code>Shipped</code> : relancer le programme affiche encore 1, car SQL Server compte les lignes trouvées par le <code>WHERE</code>, même si la valeur ne change pas."
      ],
      explain: "Le nombre renvoyé est ton meilleur indicateur : 0 signifie souvent « rien trouvé » et mérite un message à l'utilisateur."
    },
    {
      title: "ExecuteScalar : des chiffres, et le piège du DBNull",
      code: `using System.Globalization;
using Microsoft.Data.SqlClient;

// Affiche les décimaux avec un point, quel que soit ton PC
CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = connection.CreateCommand();

command.CommandText = "SELECT COUNT(*) FROM Customers";
int customers = (int)command.ExecuteScalar()!;
Console.WriteLine($"Clients : {customers}");

command.CommandText = "SELECT SUM(Quantity * UnitPrice) FROM OrderLines";
decimal revenue = (decimal)command.ExecuteScalar()!;
Console.WriteLine($"Chiffre d'affaires : {revenue}");

// Aucune ligne ne correspond : MAX renvoie NULL
command.CommandText = "SELECT MAX(Price) FROM Products WHERE Stock > 1000";
object? result = command.ExecuteScalar();
Console.WriteLine(result is DBNull ? "Aucun produit avec plus de 1000 en stock" : $"Prix max : {result}");`,
      output: `Clients : 4
Chiffre d'affaires : 736.75
Aucun produit avec plus de 1000 en stock`,
      steps: [
        "<code>CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;</code> : sans cette ligne, un PC français afficherait <code>736,75</code>. On fixe la culture pour un affichage identique partout.",
        "<code>(int)command.ExecuteScalar()!</code> : <code>COUNT(*)</code> renvoie un <code>int</code> SQL, donc un <code>int</code> C# dans la boîte <code>object</code>.",
        "<code>SUM(Quantity * UnitPrice)</code> : la somme des 8 lignes de commande, 736.75 (y compris la commande annulée, puisqu'il n'y a pas de <code>WHERE</code>). Le résultat est un <code>decimal</code>, d'où le cast <code>(decimal)</code>.",
        "<code>MAX(Price) … WHERE Stock &gt; 1000</code> : aucun produit ne correspond. Un agrégat renvoie quand même une ligne, avec la valeur <code>NULL</code>.",
        "<code>result is DBNull</code> : ce <code>NULL</code> SQL arrive en C# sous la forme <code>DBNull.Value</code>, pas <code>null</code>. Un cast <code>(decimal)result</code> aurait planté."
      ]
    },
    {
      title: "Insérer une ligne et récupérer son Id",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

// OUTPUT INSERTED.Id renvoie l'Id créé par la base
using var insert = new SqlCommand("""
    INSERT INTO Products (Name, Price, Stock)
    OUTPUT INSERTED.Id
    VALUES (N'Tapis de souris', 14.90, 60)
    """, connection);
int newId = (int)insert.ExecuteScalar()!;
Console.WriteLine($"Produit créé avec l'Id {newId}");

// On nettoie : le tapis n'était qu'un test
using var delete = new SqlCommand(
    "DELETE FROM Products WHERE Name = N'Tapis de souris'", connection);
Console.WriteLine($"Produits supprimés : {delete.ExecuteNonQuery()}");`,
      output: `Produit créé avec l'Id 7
Produits supprimés : 1`,
      steps: [
        "<code>\"\"\" … \"\"\"</code> : une raw string sur plusieurs lignes. L'indentation commune est retirée automatiquement, le SQL reste propre.",
        "<code>OUTPUT INSERTED.Id</code> : SQL Server renvoie une ligne contenant l'Id de la ligne qu'il vient d'insérer.",
        "<code>N'Tapis de souris'</code> : le préfixe <code>N</code> indique une chaîne Unicode, adaptée à une colonne <code>nvarchar</code>.",
        "<code>(int)insert.ExecuteScalar()!</code> : comme il y a une ligne en retour, on lit l'Id avec <code>ExecuteScalar</code> et non <code>ExecuteNonQuery</code>.",
        "<code>delete.ExecuteNonQuery()</code> : on supprime la ligne de test et on affiche le nombre de lignes supprimées."
      ],
      explain: "Chez toi, l'Id peut être différent : un IDENTITY ne réutilise jamais un numéro, même après un DELETE. Relance le programme et tu obtiendras 8, puis 9…"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le prix moyen",
      prompt: `<p>Affiche le prix moyen des produits avec <code>SELECT AVG(Price) FROM Products</code>, arrondi à deux décimales avec <code>Math.Round</code>.</p>`,
      hint: `<p><code>AVG</code> sur une colonne <code>decimal</code> renvoie un <code>decimal</code> : caste avec <code>(decimal)</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = new SqlCommand("SELECT AVG(Price) FROM Products", connection);
decimal average = (decimal)command.ExecuteScalar()!;
Console.WriteLine($"Prix moyen : {Math.Round(average, 2)}");`
    },
    {
      level: "moyen",
      title: "Réapprovisionner les ruptures",
      prompt: `<p>Mets à 20 le stock de tous les produits dont le stock vaut 0, puis affiche « n produit(s) réapprovisionné(s) ». Si n vaut 0, affiche plutôt « Aucune rupture de stock ».</p>`,
      hint: `<p><code>UPDATE Products SET Stock = 20 WHERE Stock = 0</code> avec <code>ExecuteNonQuery</code>, puis un <code>if</code> sur le résultat.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = new SqlCommand("UPDATE Products SET Stock = 20 WHERE Stock = 0", connection);
int rows = command.ExecuteNonQuery();

if (rows == 0)
    Console.WriteLine("Aucune rupture de stock");
else
    Console.WriteLine($"{rows} produit(s) réapprovisionné(s)");`
    },
    {
      level: "difficile",
      title: "Créer une commande complète",
      prompt: `<p>Crée une commande <code>Pending</code> pour le client 3, récupère son Id avec <code>OUTPUT INSERTED.Id</code>, puis insère une ligne de commande (produit 2, quantité 2, prix 39.50) pour cette commande. Affiche l'Id de la commande et le nombre de lignes insérées. Comme on n'a pas encore vu les paramètres, tu as exceptionnellement le droit d'insérer l'Id (un <code>int</code> que tu as toi-même reçu de la base) dans le SQL.</p>`,
      hint: `<p>Premier <code>ExecuteScalar</code> pour l'<code>INSERT INTO Orders</code>, puis un <code>ExecuteNonQuery</code> pour l'<code>INSERT INTO OrderLines</code> construit avec <code>$"… VALUES ({orderId}, 2, 2, 39.50)"</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

using var command = connection.CreateCommand();
command.CommandText = """
    INSERT INTO Orders (CustomerId, OrderDate, Status)
    OUTPUT INSERTED.Id
    VALUES (3, SYSUTCDATETIME(), 'Pending')
    """;
int orderId = (int)command.ExecuteScalar()!;

// orderId est un int venu de la base : pas de risque ici.
// Dès la leçon suivante sur les paramètres, on n'écrira plus jamais ça.
command.CommandText =
    $"INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES ({orderId}, 2, 2, 39.50)";
int lines = command.ExecuteNonQuery();

Console.WriteLine($"Commande {orderId} créée avec {lines} ligne(s)");`
    }
  ],
  quiz: [
    {
      q: `Quelle méthode utiliser pour un <code>DELETE</code> dont tu veux savoir combien de lignes il a supprimées ?`,
      options: ["<code>ExecuteScalar()</code>", "<code>ExecuteReader()</code>", "<code>ExecuteNonQuery()</code>"],
      answer: 2,
      why: `<code>ExecuteNonQuery</code> renvoie le nombre de lignes affectées. <code>ExecuteScalar</code> renverrait <code>null</code> car un <code>DELETE</code> simple ne renvoie aucune ligne.`
    },
    {
      q: `Un <code>UPDATE … WHERE Id = 999</code> ne trouve aucune ligne. Que se passe-t-il ?`,
      options: ["Une <code>SqlException</code> est levée", "<code>ExecuteNonQuery</code> renvoie 0", "<code>ExecuteNonQuery</code> renvoie -1"],
      answer: 1,
      why: `Pour SQL Server, modifier zéro ligne n'est pas une erreur. Il renvoie simplement 0, et c'est au code C# de le traiter. -1 est réservé aux instructions qui ne comptent pas de lignes, comme <code>CREATE TABLE</code>.`
    },
    {
      q: `<code>SELECT MAX(Price) FROM Products WHERE Stock &gt; 1000</code> ne trouve aucun produit. Que renvoie <code>ExecuteScalar</code> ?`,
      options: ["<code>DBNull.Value</code>", "<code>null</code>", "0"],
      answer: 0,
      why: `Un agrégat renvoie toujours une ligne, ici avec la valeur SQL <code>NULL</code>, représentée par <code>DBNull.Value</code>. Le <code>null</code> C# n'apparaît que si la requête ne renvoie aucune ligne du tout.`
    },
    {
      q: `Comment récupérer l'Id <code>IDENTITY</code> d'une ligne que tu insères ?`,
      options: ["Avec <code>SELECT MAX(Id)</code> juste après", "Avec <code>OUTPUT INSERTED.Id</code> et <code>ExecuteScalar</code>", "Avec la valeur de retour d'<code>ExecuteNonQuery</code>"],
      answer: 1,
      why: `<code>OUTPUT INSERTED.Id</code> renvoie l'Id exact de ta ligne. <code>MAX(Id)</code> est un piège : si quelqu'un d'autre insère au même moment, tu récupères son Id. <code>ExecuteNonQuery</code> renvoie un nombre de lignes, pas un Id.`
    }
  ],
  project: `<p><strong>OrderFlow : un premier menu.</strong> Dans <code>Program.cs</code>, après la vérification de connexion, affiche un menu en boucle : « 1. Statistiques », « 2. Expédier les commandes payées », « 0. Quitter ».</p>
<p>L'option 1 affiche, grâce à trois <code>ExecuteScalar</code>, le nombre de produits, le nombre de clients et le nombre de commandes au statut <code>Pending</code>. L'option 2 exécute <code>UPDATE Orders SET Status = 'Shipped' WHERE Status = 'Paid'</code> et affiche « n commande(s) expédiée(s) », ou « Rien à expédier » si <code>ExecuteNonQuery</code> renvoie 0. Range ces deux traitements dans des méthodes d'une classe <code>OrderFlowStats</code> pour garder <code>Program.cs</code> court.</p>`,
  resources: [
    { label: "SqlCommand (référence Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/microsoft.data.sqlclient.sqlcommand" },
    { label: "Clause OUTPUT (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/output-clause-transact-sql" }
  ]
});

// =====================================================================
// ADO.NET : les bases — 4. Le lecteur
// =====================================================================
window.COURSE.push({
  key: "ado-reader",
  title: "Lire des lignes avec SqlDataReader et les transformer en objets",
  summary: "Tu sauras parcourir le résultat d'un SELECT ligne par ligne, lire chaque colonne avec le bon type, gérer les NULL et remplir une liste d'objets C#.",
  objectives: [
    "Parcourir un résultat avec Read()",
    "Lire une colonne avec la bonne méthode Get selon son type SQL",
    "Tester une valeur NULL avec IsDBNull",
    "Transformer chaque ligne en objet et renvoyer une List"
  ],
  analogy: `<p>Imagine que tu lis une longue liste au téléphone à un ami. Tu poses le <strong>doigt</strong> sur la première ligne, tu la lis à voix haute, puis tu descends d'une ligne. Tu ne peux pas remonter, et tant que tu lis, la ligne téléphonique est occupée.</p>
<p>Le <code>SqlDataReader</code>, c'est ce doigt. <code>Read()</code> le fait descendre d'une ligne. Et pour garder la liste après avoir raccroché, tu la recopies dans ton carnet : c'est le passage des lignes aux <strong>objets C#</strong>.</p>`,
  lesson: `<h3>Le lecteur avance ligne par ligne</h3>
<p><code>ExecuteReader()</code> renvoie un <code>SqlDataReader</code>. Au départ, il est positionné <strong>avant</strong> la première ligne. Chaque appel à <code>Read()</code> passe à la ligne suivante et renvoie <code>true</code> ; quand il n'y a plus de ligne, il renvoie <code>false</code>. D'où la boucle classique <code>while (reader.Read()) { … }</code>.</p>
<p>Le lecteur est <strong>en avant seulement</strong> (impossible de revenir à une ligne précédente) et <strong>en lecture seule</strong>. En échange, il est très rapide et ne garde en mémoire qu'une ligne à la fois : tu peux parcourir un million de lignes sans saturer la mémoire.</p>
<pre class="diagram">
              Id  Name               Price
 (départ) -&gt;
 Read() true  3   Écran 27 pouces    279.00
 Read() true  4   Casque audio       149.00
 Read() true  1   Clavier mécanique   89.90
   ...
 Read() false     (plus de ligne : fin)
</pre>
<div class="tip">Tant qu'un lecteur est ouvert, sa connexion est <strong>occupée</strong> : tu ne peux pas exécuter une autre commande dessus. Ferme toujours le lecteur avec <code>using</code> avant d'enchaîner, ou lis tout dans une liste d'abord.</div>

<h3>Lire une colonne avec le bon type</h3>
<p>Sur la ligne courante, on lit chaque colonne avec une méthode <code>Get…</code> qui correspond au type SQL. On désigne la colonne par sa <strong>position</strong> (son ordinal), en commençant à 0, dans l'ordre du <code>SELECT</code>.</p>
<table>
<tr><th>Type SQL</th><th>Type C#</th><th>Méthode</th></tr>
<tr><td><code>int</code></td><td><code>int</code></td><td><code>GetInt32(i)</code></td></tr>
<tr><td><code>bigint</code></td><td><code>long</code></td><td><code>GetInt64(i)</code></td></tr>
<tr><td><code>nvarchar</code></td><td><code>string</code></td><td><code>GetString(i)</code></td></tr>
<tr><td><code>decimal(10,2)</code></td><td><code>decimal</code></td><td><code>GetDecimal(i)</code></td></tr>
<tr><td><code>datetime2</code></td><td><code>DateTime</code></td><td><code>GetDateTime(i)</code></td></tr>
<tr><td><code>bit</code></td><td><code>bool</code></td><td><code>GetBoolean(i)</code></td></tr>
</table>
<p>Ces méthodes ne convertissent rien : <code>GetInt64</code> sur une colonne <code>int</code> lève une <code>InvalidCastException</code>. Le type C# doit correspondre exactement au type SQL.</p>
<p>Les numéros de colonne sont fragiles : si quelqu'un ajoute une colonne au début du <code>SELECT</code>, tout se décale. Pour plus de clarté, demande la position par le nom avec <code>reader.GetOrdinal("Price")</code>, une seule fois avant la boucle. Il existe aussi <code>reader["Price"]</code>, qui renvoie un <code>object</code> à caster : pratique, mais moins rapide et moins sûr.</p>

<h3>Les valeurs NULL</h3>
<p>Si une colonne vaut <code>NULL</code>, <code>GetString</code> ou <code>GetDateTime</code> lèvent une exception (<code>SqlNullValueException</code>). Il faut donc tester <strong>avant</strong> de lire, avec <code>reader.IsDBNull(i)</code>, et choisir un type C# nullable :</p>
<p><code>DateTime? last = reader.IsDBNull(2) ? null : reader.GetDateTime(2);</code></p>
<p>Les tables OrderFlow n'ont pas de colonne nullable, mais un <code>LEFT JOIN</code> en fabrique : un client sans commande reçoit <code>NULL</code> dans les colonnes de la commande. C'est le troisième exemple.</p>

<h3>Des lignes aux objets</h3>
<p>Un lecteur doit vivre le moins longtemps possible. Le bon réflexe : écrire une méthode qui ouvre la connexion, lit toutes les lignes, crée <strong>un objet par ligne</strong>, les range dans une <code>List&lt;Product&gt;</code> et la renvoie. Connexion et lecteur sont fermés à la sortie de la méthode, et le reste du programme ne manipule que des objets C#, sur lesquels LINQ fonctionne.</p>
<div class="flow"><span>SELECT</span><span>ligne SQL</span><span>new Product(…)</span><span>List&lt;Product&gt;</span><span>LINQ, affichage</span></div>
<p>Ce passage d'une ligne à un objet s'appelle le <strong>mapping</strong>. En ADO.NET, tu l'écris à la main. C'est exactement ce que Dapper automatise : il lit les noms de colonnes et remplit les propriétés du même nom. Côté Angular, c'est l'équivalent du <code>map()</code> qui transforme la réponse JSON en objets typés.</p>
<p>Pour une colonne texte qui représente une énumération, comme <code>Status</code>, tu peux la convertir pendant le mapping : <code>Enum.Parse&lt;OrderStatus&gt;(reader.GetString(3))</code>.</p>

<h3>Plusieurs résultats d'un coup</h3>
<p>Une commande peut contenir deux <code>SELECT</code> séparés par un point-virgule. Le lecteur parcourt d'abord le premier résultat ; <code>reader.NextResult()</code> passe ensuite au second. Pratique pour charger une commande et ses lignes en un seul aller-retour.</p>
<div class="note">Évite <code>SELECT *</code> dans le code : liste les colonnes dont tu as besoin, dans l'ordre où tu les lis. Tu transfères moins de données, et une colonne ajoutée à la table ne casse pas ton mapping.</div>`,
  examples: [
    {
      title: "Lire chaque colonne avec le bon type",
      code: `using System.Globalization;
using Microsoft.Data.SqlClient;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = new SqlCommand(
    "SELECT Id, Name, Price, Stock FROM Products ORDER BY Price DESC", connection);
using var reader = command.ExecuteReader();

// On cherche la position de chaque colonne une seule fois
int idCol = reader.GetOrdinal("Id");
int nameCol = reader.GetOrdinal("Name");
int priceCol = reader.GetOrdinal("Price");
int stockCol = reader.GetOrdinal("Stock");

while (reader.Read())
{
    int id = reader.GetInt32(idCol);
    string name = reader.GetString(nameCol);
    decimal price = reader.GetDecimal(priceCol);
    int stock = reader.GetInt32(stockCol);
    Console.WriteLine($"#{id} {name,-18} {price,7} EUR (stock : {stock})");
}`,
      output: `#3 Écran 27 pouces     279.00 EUR (stock : 10)
#4 Casque audio        149.00 EUR (stock : 0)
#1 Clavier mécanique    89.90 EUR (stock : 25)
#6 Webcam HD            59.90 EUR (stock : 15)
#2 Souris sans fil      39.50 EUR (stock : 80)
#5 Câble USB-C           9.99 EUR (stock : 300)`,
      steps: [
        "<code>ORDER BY Price DESC</code> : les produits arrivent du plus cher au moins cher.",
        "<code>reader.GetOrdinal(\"Price\")</code> : renvoie la position de la colonne <code>Price</code> (ici 2). On le fait une fois, avant la boucle.",
        "<code>while (reader.Read())</code> : une itération par produit, jusqu'à ce que <code>Read()</code> renvoie <code>false</code>.",
        "<code>reader.GetDecimal(priceCol)</code> : <code>Price</code> est un <code>decimal(10,2)</code> en SQL, donc un <code>decimal</code> en C#. La valeur garde ses deux décimales : <code>279.00</code>.",
        "<code>{name,-18}</code> et <code>{price,7}</code> : alignement dans l'interpolation. -18 aligne à gauche sur 18 caractères, 7 aligne à droite sur 7."
      ]
    },
    {
      title: "Transformer les lignes en objets",
      code: `using System.Globalization;
using Microsoft.Data.SqlClient;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

List<Product> products = LoadProducts();
Console.WriteLine($"{products.Count} produits chargés");

// Ce sont maintenant des objets C# : LINQ fonctionne
foreach (var p in products.Where(p => p.Stock == 0))
    Console.WriteLine($"Rupture : {p.Name}");
Console.WriteLine($"Valeur du stock : {products.Sum(p => p.Price * p.Stock)} EUR");

List<Product> LoadProducts()
{
    var result = new List<Product>();
    using var connection = new SqlConnection(connectionString);
    connection.Open();
    using var command = new SqlCommand("SELECT Id, Name, Price, Stock FROM Products", connection);
    using var reader = command.ExecuteReader();
    while (reader.Read())
    {
        // Une ligne SQL devient un objet Product
        result.Add(new Product(reader.GetInt32(0), reader.GetString(1),
                               reader.GetDecimal(2), reader.GetInt32(3)));
    }
    return result;
}

record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `6 produits chargés
Rupture : Casque audio
Valeur du stock : 12093.00 EUR`,
      steps: [
        "<code>record Product(int Id, string Name, decimal Price, int Stock);</code> : un record avec les mêmes noms et types que les colonnes de la table.",
        "<code>List&lt;Product&gt; LoadProducts()</code> : la méthode ouvre la connexion, lit tout, et renvoie une liste. Les <code>using</code> ferment lecteur et connexion à la sortie.",
        "<code>result.Add(new Product(…))</code> : le mapping. Chaque ligne devient un objet, les colonnes sont lues dans l'ordre du <code>SELECT</code>.",
        "<code>products.Where(p =&gt; p.Stock == 0)</code> : une fois en mémoire, on filtre avec LINQ, sans retourner à la base.",
        "<code>products.Sum(p =&gt; p.Price * p.Stock)</code> : la somme prix × stock des 6 produits, soit 12093.00."
      ],
      explain: "Le reste du programme ne sait plus qu'il existe une base : il reçoit une List&lt;Product&gt;, comme n'importe quelle collection."
    },
    {
      title: "Gérer les NULL d'un LEFT JOIN",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

// LEFT JOIN : un client sans commande aura NULL dans LastOrder
using var command = new SqlCommand("""
    SELECT c.Name, COUNT(o.Id) AS OrderCount, MAX(o.OrderDate) AS LastOrder
    FROM Customers c
    LEFT JOIN Orders o ON o.CustomerId = c.Id
    GROUP BY c.Name
    ORDER BY c.Name
    """, connection);
using var reader = command.ExecuteReader();

while (reader.Read())
{
    string name = reader.GetString(0);
    int count = reader.GetInt32(1);
    // On teste NULL AVANT de lire, sinon GetDateTime lève une exception
    DateTime? last = reader.IsDBNull(2) ? null : reader.GetDateTime(2);
    string lastText = last?.ToString("yyyy-MM-dd") ?? "jamais";
    Console.WriteLine($"{name} : {count} commande(s), dernière : {lastText}");
}`,
      output: `Alice Martin : 2 commande(s), dernière : 2026-03-15
Bob Durand : 2 commande(s), dernière : 2026-04-10
Chloé Bernard : 1 commande(s), dernière : 2026-04-02
David Petit : 0 commande(s), dernière : jamais`,
      steps: [
        "<code>LEFT JOIN Orders o ON o.CustomerId = c.Id</code> : garde tous les clients, même ceux sans commande.",
        "<code>COUNT(o.Id)</code> : compte seulement les commandes existantes, donc 0 pour David (jamais <code>NULL</code>).",
        "<code>MAX(o.OrderDate)</code> : pour David, il n'y a aucune date, le résultat est <code>NULL</code>.",
        "<code>reader.IsDBNull(2) ? null : reader.GetDateTime(2)</code> : on teste d'abord, puis on lit. Le type <code>DateTime?</code> peut contenir l'absence de valeur.",
        "<code>last?.ToString(\"yyyy-MM-dd\") ?? \"jamais\"</code> : si <code>last</code> est <code>null</code>, <code>?.</code> renvoie <code>null</code> et <code>??</code> prend le texte de secours."
      ],
      explain: "Retire le test IsDBNull et lance : à la ligne de David, GetDateTime lève une SqlNullValueException."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les produits en rupture",
      prompt: `<p>Affiche le nom de chaque produit dont le stock vaut 0, en filtrant directement en SQL avec <code>WHERE Stock = 0</code>. Si aucune ligne n'est lue, affiche « Aucune rupture ».</p>`,
      hint: `<p>La propriété <code>reader.HasRows</code> indique, avant la boucle, si le résultat contient au moins une ligne.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = new SqlCommand("SELECT Name FROM Products WHERE Stock = 0", connection);
using var reader = command.ExecuteReader();

if (!reader.HasRows)
    Console.WriteLine("Aucune rupture");

while (reader.Read())
    Console.WriteLine($"En rupture : {reader.GetString(0)}");`
    },
    {
      level: "moyen",
      title: "Charger les clients en objets",
      prompt: `<p>Écris une fonction <code>List&lt;Customer&gt; LoadCustomers()</code> qui lit <code>Id, Name, Email, CreatedAt</code> et renvoie une liste de <code>record Customer(int Id, string Name, string Email, DateTime CreatedAt)</code>. Affiche ensuite, avec LINQ, les clients inscrits depuis le 1er février 2026.</p>`,
      hint: `<p><code>CreatedAt</code> est un <code>datetime2</code> : lis-le avec <code>GetDateTime(3)</code>. Le filtre LINQ : <code>c.CreatedAt &gt;= new DateTime(2026, 2, 1)</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var customers = LoadCustomers();
foreach (var c in customers.Where(c => c.CreatedAt >= new DateTime(2026, 2, 1)))
    Console.WriteLine($"{c.Name} inscrit le {c.CreatedAt:yyyy-MM-dd}");

List<Customer> LoadCustomers()
{
    var result = new List<Customer>();
    using var connection = new SqlConnection(connectionString);
    connection.Open();
    using var command = new SqlCommand("SELECT Id, Name, Email, CreatedAt FROM Customers", connection);
    using var reader = command.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new Customer(reader.GetInt32(0), reader.GetString(1),
                                reader.GetString(2), reader.GetDateTime(3)));
    }
    return result;
}

record Customer(int Id, string Name, string Email, DateTime CreatedAt);`
    },
    {
      level: "difficile",
      title: "Des commandes avec un statut typé",
      prompt: `<p>Déclare <code>enum OrderStatus { Pending, Paid, Shipped, Cancelled }</code> et <code>record OrderView(int Id, string CustomerName, DateTime OrderDate, OrderStatus Status)</code>. Charge toutes les commandes avec le nom du client (jointure sur <code>Customers</code>), en convertissant la colonne <code>Status</code> avec <code>Enum.Parse&lt;OrderStatus&gt;</code>. Affiche ensuite le nombre de commandes par statut avec <code>GroupBy</code>.</p>`,
      hint: `<p>SQL : <code>SELECT o.Id, c.Name, o.OrderDate, o.Status FROM Orders o JOIN Customers c ON c.Id = o.CustomerId</code>. Puis <code>orders.GroupBy(o =&gt; o.Status)</code> avec <code>g.Key</code> et <code>g.Count()</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var orders = new List<OrderView>();
using (var connection = new SqlConnection(connectionString))
{
    connection.Open();
    using var command = new SqlCommand("""
        SELECT o.Id, c.Name, o.OrderDate, o.Status
        FROM Orders o
        JOIN Customers c ON c.Id = o.CustomerId
        """, connection);
    using var reader = command.ExecuteReader();
    while (reader.Read())
    {
        orders.Add(new OrderView(reader.GetInt32(0), reader.GetString(1), reader.GetDateTime(2),
                                 Enum.Parse<OrderStatus>(reader.GetString(3))));
    }
}

foreach (var group in orders.GroupBy(o => o.Status))
    Console.WriteLine($"{group.Key} : {group.Count()}");

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

record OrderView(int Id, string CustomerName, DateTime OrderDate, OrderStatus Status);`
    }
  ],
  quiz: [
    {
      q: `Que renvoie <code>reader.Read()</code> quand il n'y a plus de ligne ?`,
      options: ["<code>null</code>", "<code>false</code>", "Il lève une exception"],
      answer: 1,
      why: `<code>Read()</code> renvoie <code>true</code> tant qu'il a pu passer à une nouvelle ligne, et <code>false</code> à la fin. C'est ce qui arrête la boucle <code>while</code>.`
    },
    {
      q: `La colonne <code>Price</code> est un <code>decimal(10,2)</code>. Quelle méthode utiliser ?`,
      options: ["<code>GetDouble</code>", "<code>GetString</code>", "<code>GetDecimal</code>"],
      answer: 2,
      why: `Le type C# doit correspondre exactement au type SQL : <code>decimal</code> donne <code>decimal</code>. <code>GetDouble</code> lèverait une <code>InvalidCastException</code>, et un prix ne doit de toute façon jamais être un <code>double</code>.`
    },
    {
      q: `Une colonne peut valoir <code>NULL</code>. Que faire avant <code>GetString(i)</code> ?`,
      options: ["Tester <code>reader.IsDBNull(i)</code>", "Rien, <code>GetString</code> renvoie <code>null</code>", "Comparer avec <code>== null</code>"],
      answer: 0,
      why: `<code>GetString</code> sur un <code>NULL</code> lève une exception. Il faut tester <code>IsDBNull</code> avant de lire. Le piège : croire que <code>GetString</code> renvoie <code>null</code>.`
    },
    {
      q: `Pourquoi renvoyer une <code>List&lt;Product&gt;</code> plutôt que le lecteur lui-même ?`,
      options: ["Parce qu'un lecteur ne peut lire que 100 lignes", "Pour fermer vite la connexion et manipuler ensuite de simples objets C#", "Parce qu'une liste est plus rapide qu'un lecteur"],
      answer: 1,
      why: `Un lecteur ouvert bloque sa connexion. En copiant les lignes dans des objets, on ferme tout de suite et le reste du code travaille avec LINQ, sans dépendre de la base. Le lecteur n'a pas de limite de lignes.`
    }
  ],
  project: `<p><strong>OrderFlow : lister le catalogue.</strong> Réutilise les classes <code>Product</code> et <code>Customer</code> créées au chapitre SQL. Ajoute une classe statique <code>ProductData</code> avec une méthode <code>List&lt;Product&gt; GetAll()</code> qui lit la table triée par nom et remplit un <code>new Product { Id = …, Name = …, Price = …, Stock = … }</code> par ligne, en utilisant <code>GetOrdinal</code>.</p>
<p>Ajoute au menu l'option « 3. Lister les produits », qui affiche chaque produit avec son prix et signale « (rupture) » quand le stock vaut 0. Fais de même avec <code>CustomerData.GetAll()</code> et une option « 4. Lister les clients ». Au chapitre suivant, ces classes deviendront de vrais repositories.</p>`,
  resources: [
    { label: "Récupérer des données avec un DataReader (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/framework/data/adonet/retrieving-data-using-a-datareader" },
    { label: "SqlDataReader (référence Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/microsoft.data.sqlclient.sqldatareader" }
  ]
});

// =====================================================================
// ADO.NET : les bases — 5. Paramètres et injection SQL
// =====================================================================
window.COURSE.push({
  key: "ado-params",
  title: "Paramètres et injection SQL",
  summary: "Tu sauras pourquoi on ne colle jamais une saisie dans du SQL, comment une injection fonctionne, et comment écrire toutes tes requêtes avec des paramètres typés.",
  objectives: [
    "Comprendre et reconnaître une injection SQL",
    "Écrire une requête avec des paramètres @nom",
    "Préférer Parameters.Add avec un type explicite à AddWithValue",
    "Gérer NULL, LIKE et les erreurs d'unicité avec des paramètres"
  ],
  analogy: `<p>Imagine un <strong>formulaire papier</strong> à la mairie. La case « Nom » est faite pour un nom. Si quelqu'un y écrit « Dupont, et donnez-lui aussi les clés du coffre », l'agent lit simplement un nom un peu bizarre : il ne va pas exécuter la consigne.</p>
<p>Maintenant, imagine une <strong>lettre</strong> que tu écris en recopiant mot pour mot ce que dit le visiteur : « Donnez le dossier de » + ses paroles. Le visiteur peut y glisser n'importe quelle instruction, et elle fera partie de la lettre. Les <strong>paramètres</strong>, c'est le formulaire. La <strong>concaténation</strong>, c'est la lettre.</p>`,
  lesson: `<h3>Le problème : coller la saisie dans le SQL</h3>
<p>Tu veux chercher un client par son e-mail. Le réflexe naturel serait d'écrire <code>"SELECT Name FROM Customers WHERE Email = '" + email + "'"</code>. Ça marche… tant que l'utilisateur tape un vrai e-mail.</p>
<p>Mais le texte saisi devient <strong>une partie du code SQL</strong>. Si l'utilisateur tape <code>x' OR 1=1 --</code>, la requête envoyée devient :</p>
<p><code>SELECT Name FROM Customers WHERE Email = 'x' OR 1=1 --'</code></p>
<p>L'apostrophe ferme la chaîne, <code>OR 1=1</code> est toujours vrai, et <code>--</code> transforme la fin en commentaire. Résultat : <strong>tous</strong> les clients sont renvoyés. C'est une <strong>injection SQL</strong>.</p>
<div class="flow"><span>Saisie piégée</span><span>Collée dans le SQL</span><span>Le SQL change de sens</span><span>Fuite ou destruction</span></div>
<p>L'attaquant peut aller beaucoup plus loin : <code>'; DELETE FROM Orders; --</code> enchaîne une deuxième instruction. L'injection SQL fait partie des failles les plus exploitées depuis plus de vingt ans.</p>

<h3>La solution : les paramètres</h3>
<p>Un <strong>paramètre</strong> est une valeur envoyée à SQL Server <strong>séparément</strong> du texte SQL. Dans le SQL, on écrit seulement un nom qui commence par <code>@</code> : <code>WHERE Email = @email</code>. Puis on ajoute la valeur à la commande :</p>
<p><code>command.Parameters.Add("@email", SqlDbType.NVarChar, 200).Value = email;</code></p>
<p>SQL Server reçoit le texte et les valeurs dans deux cases différentes. Il analyse le texte, puis utilise les valeurs comme des <strong>données</strong>, jamais comme du code. Quoi que tape l'utilisateur, même avec des apostrophes, c'est juste un e-mail un peu bizarre qui ne correspond à aucun client.</p>
<div class="compare"><div><h4>Concaténation</h4><p>La saisie fait partie du texte SQL. Une apostrophe casse la requête, une saisie piégée la détourne.</p></div><div><h4>Paramètre</h4><p>La saisie voyage à part. Elle n'est jamais interprétée comme du SQL. Apostrophes et accents passent sans souci.</p></div></div>
<p>Bonus : comme le texte SQL reste identique d'un appel à l'autre, SQL Server réutilise son <strong>plan d'exécution</strong> (sa stratégie pour exécuter la requête) au lieu de le recalculer à chaque fois.</p>
<div class="tip">Interpoler avec <code>$"… WHERE Email = '{email}'"</code> est <strong>exactement</strong> aussi dangereux que la concaténation avec <code>+</code>. L'interpolation C# fabrique une chaîne, rien de plus.</div>

<h3>Add ou AddWithValue ?</h3>
<p>Il existe deux façons d'ajouter un paramètre :</p>
<table>
<tr><th>Écriture</th><th>Type SQL envoyé</th><th>Usage</th></tr>
<tr><td><code>Parameters.AddWithValue("@email", email)</code></td><td>Déduit de la valeur C# (une <code>string</code> devient un <code>nvarchar</code> de la longueur du texte)</td><td>Rapide pour un test</td></tr>
<tr><td><code>Parameters.Add("@email", SqlDbType.NVarChar, 200).Value = email</code></td><td>Exactement celui de la colonne</td><td>Le choix par défaut en entreprise</td></tr>
</table>
<p><code>AddWithValue</code> est sûr contre l'injection, mais il devine le type. S'il se trompe (par exemple <code>nvarchar</code> pour une colonne <code>varchar</code>), SQL Server doit convertir chaque ligne et ne peut plus bien utiliser ses index. Et comme la taille change avec chaque texte, il peut fabriquer un plan par longueur. Avec <code>Add</code> et le type de la colonne, aucune surprise.</p>
<p>Pour un <code>decimal</code>, précise aussi <code>Precision</code> et <code>Scale</code> (10 et 2 pour nos prix), comme dans le deuxième exemple.</p>

<h3>Les cas particuliers</h3>
<p><strong>NULL</strong> : un paramètre n'accepte pas le <code>null</code> C# comme valeur SQL. Il faut lui donner <code>DBNull.Value</code> : <code>.Value = (object?)phone ?? DBNull.Value;</code>.</p>
<p><strong>LIKE</strong> : les jokers <code>%</code> se mettent dans la <strong>valeur</strong>, pas dans le SQL : <code>WHERE Name LIKE @pattern</code> avec <code>.Value = $"%{search}%"</code>.</p>
<p><strong>Noms de table, de colonne, ORDER BY</strong> : ils ne peuvent pas être des paramètres. Si l'utilisateur choisit la colonne de tri, compare son choix à une <strong>liste blanche</strong> de noms autorisés écrite dans ton code, et n'utilise que les valeurs de cette liste.</p>
<div class="note">Les paramètres sont la première ligne de défense, pas la seule. En production, l'application se connecte avec un compte SQL qui n'a que les droits nécessaires (lire et écrire ses tables, jamais <code>DROP</code> ni administrateur). Si une faille passe quand même, les dégâts restent limités. Dapper et EF Core génèrent eux aussi des paramètres : c'est la même mécanique que tu apprends ici.</div>`,
  examples: [
    {
      title: "Une injection en direct, puis la version sûre",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

// Ce qu'un utilisateur malveillant tape dans le champ « e-mail »
string email = "x' OR 1=1 --";

using var connection = new SqlConnection(connectionString);
connection.Open();

// DANGER : on colle la saisie dans le texte SQL
string sql = "SELECT Name FROM Customers WHERE Email = '" + email + "'";
Console.WriteLine(sql);
using (var bad = new SqlCommand(sql, connection))
using (var reader = bad.ExecuteReader())
    while (reader.Read()) Console.WriteLine($"  fuite : {reader.GetString(0)}");

// CORRECT : la saisie voyage à part, dans un paramètre
using var good = new SqlCommand("SELECT Name FROM Customers WHERE Email = @email", connection);
good.Parameters.AddWithValue("@email", email);
var found = good.ExecuteScalar();
Console.WriteLine(found is null ? "Paramétré : aucun client trouvé" : $"Paramétré : {found}");`,
      output: `SELECT Name FROM Customers WHERE Email = 'x' OR 1=1 --'
  fuite : Alice Martin
  fuite : Bob Durand
  fuite : Chloé Bernard
  fuite : David Petit
Paramétré : aucun client trouvé`,
      steps: [
        "<code>string email = \"x' OR 1=1 --\";</code> : on simule une saisie malveillante. Dans une vraie application, elle viendrait d'un formulaire ou d'une API.",
        "<code>\"… WHERE Email = '\" + email + \"'\"</code> : la concaténation. On affiche le SQL obtenu : la condition est devenue <code>OR 1=1</code>, toujours vraie.",
        "<code>using (var bad = …) using (var reader = …)</code> : deux <code>using</code> empilés, pour que le lecteur soit fermé avant d'exécuter la commande suivante sur la même connexion.",
        "<code>fuite : …</code> : les quatre clients sont renvoyés alors que l'utilisateur ne connaissait aucun e-mail.",
        "<code>WHERE Email = @email</code> et <code>AddWithValue(\"@email\", email)</code> : la même saisie, envoyée comme paramètre. SQL Server cherche un e-mail qui vaut littéralement <code>x' OR 1=1 --</code>.",
        "<code>found is null</code> : aucune ligne, donc <code>ExecuteScalar</code> renvoie <code>null</code>. L'attaque a échoué."
      ],
      explain: "Même saisie, même table : seule la façon d'envoyer la valeur change, et elle fait toute la différence."
    },
    {
      title: "Paramètres typés : recherche avec LIKE et prix maximum",
      code: `using System.Data;
using System.Globalization;
using Microsoft.Data.SqlClient;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

string search = "s";       // texte saisi par l'utilisateur
decimal maxPrice = 100m;   // prix maximum choisi

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = new SqlCommand("""
    SELECT Name, Price FROM Products
    WHERE Name LIKE @pattern AND Price <= @maxPrice
    ORDER BY Price
    """, connection);

// Type et taille explicites : identiques aux colonnes de la table
command.Parameters.Add("@pattern", SqlDbType.NVarChar, 100).Value = $"%{search}%";
var price = command.Parameters.Add("@maxPrice", SqlDbType.Decimal);
price.Precision = 10;
price.Scale = 2;
price.Value = maxPrice;

using var reader = command.ExecuteReader();
while (reader.Read())
    Console.WriteLine($"{reader.GetString(0)} : {reader.GetDecimal(1)} EUR");`,
      output: `Câble USB-C : 9.99 EUR
Souris sans fil : 39.50 EUR`,
      steps: [
        "<code>using System.Data;</code> : nécessaire pour l'énumération <code>SqlDbType</code>.",
        "<code>WHERE Name LIKE @pattern AND Price &lt;= @maxPrice</code> : deux paramètres. Le texte SQL ne contient aucune valeur.",
        "<code>Parameters.Add(\"@pattern\", SqlDbType.NVarChar, 100)</code> : même type et même taille que la colonne <code>Name</code>. <code>Add</code> renvoie le paramètre, on règle sa <code>Value</code> dans la foulée.",
        "<code>$\"%{search}%\"</code> : les jokers <code>%</code> sont dans la valeur. On cherche donc « contient s ».",
        "<code>price.Precision = 10; price.Scale = 2;</code> : comme la colonne <code>decimal(10,2)</code>.",
        "Résultat : la recherche ignore la casse (collation par défaut de SQL Server), donc « Câble USB-C » correspond grâce au S de USB. « Casque audio » contient un s mais coûte 149 : il est écarté par le prix."
      ]
    },
    {
      title: "Insérer avec des paramètres et gérer un doublon",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

using var connection = new SqlConnection(connectionString);
connection.Open();

Console.WriteLine(AddCustomer("Emma Roux", "emma@example.com"));
Console.WriteLine(AddCustomer("Alice Bis", "alice@example.com")); // e-mail déjà pris

// Nettoyage pour pouvoir relancer l'exemple
using var cleanup = new SqlCommand("DELETE FROM Customers WHERE Email = @email", connection);
cleanup.Parameters.Add("@email", SqlDbType.NVarChar, 200).Value = "emma@example.com";
cleanup.ExecuteNonQuery();

string AddCustomer(string name, string email)
{
    using var command = new SqlCommand(
        "INSERT INTO Customers (Name, Email, CreatedAt) VALUES (@name, @email, SYSUTCDATETIME())",
        connection);
    command.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = name;
    command.Parameters.Add("@email", SqlDbType.NVarChar, 200).Value = email;
    try
    {
        command.ExecuteNonQuery();
        return $"Client créé : {name}";
    }
    catch (SqlException ex) when (ex.Number is 2627 or 2601) // violation d'unicité
    {
        return $"Refusé : l'e-mail {email} existe déjà";
    }
}`,
      output: `Client créé : Emma Roux
Refusé : l'e-mail alice@example.com existe déjà`,
      steps: [
        "<code>VALUES (@name, @email, SYSUTCDATETIME())</code> : les valeurs venant de l'extérieur sont des paramètres. La date est calculée par SQL Server.",
        "<code>Parameters.Add(\"@name\", SqlDbType.NVarChar, 100)</code> : type et taille alignés sur <code>Name nvarchar(100)</code>.",
        "<code>AddCustomer(\"Emma Roux\", …)</code> : l'e-mail est nouveau, l'insertion réussit.",
        "<code>AddCustomer(\"Alice Bis\", \"alice@example.com\")</code> : l'e-mail existe déjà, la contrainte <code>UQ_Customers_Email</code> refuse l'insertion et ADO.NET lève une <code>SqlException</code>.",
        "<code>catch (SqlException ex) when (ex.Number is 2627 or 2601)</code> : on n'attrape que la violation d'unicité (2627 pour une contrainte, 2601 pour un index unique). Toute autre erreur remonte normalement.",
        "<code>DELETE FROM Customers WHERE Email = @email</code> : même un nettoyage utilise un paramètre, par habitude."
      ],
      explain: "Laisser la base garantir l'unicité, puis traduire son erreur en message clair, est plus fiable que de vérifier avant d'insérer : deux utilisateurs pourraient passer la vérification en même temps."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Chercher un produit par son Id",
      prompt: `<p>Demande un Id à l'utilisateur avec <code>Console.ReadLine()</code> et <code>int.Parse</code>, puis affiche le nom du produit correspondant grâce à <code>SELECT Name FROM Products WHERE Id = @id</code> et <code>ExecuteScalar</code>. Affiche « Produit introuvable » si le résultat est <code>null</code>.</p>`,
      hint: `<p><code>command.Parameters.Add("@id", SqlDbType.Int).Value = id;</code> Un <code>int</code> n'a pas besoin de taille.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Console.Write("Id du produit : ");
int id = int.Parse(Console.ReadLine() ?? "0");

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = new SqlCommand("SELECT Name FROM Products WHERE Id = @id", connection);
command.Parameters.Add("@id", SqlDbType.Int).Value = id;

object? name = command.ExecuteScalar();
Console.WriteLine(name is null ? "Produit introuvable" : $"Produit : {name}");`
    },
    {
      level: "moyen",
      title: "Ajouter un produit et récupérer son Id",
      prompt: `<p>Écris une fonction <code>int AddProduct(string name, decimal price, int stock)</code> qui insère un produit avec trois paramètres typés et renvoie l'Id créé grâce à <code>OUTPUT INSERTED.Id</code>. Teste-la avec un nom contenant une apostrophe : <code>"Tapis d'souris XXL"</code>.</p>`,
      hint: `<p>Avec un paramètre, l'apostrophe ne pose aucun problème. Pour le prix : <code>SqlDbType.Decimal</code> avec <code>Precision = 10</code> et <code>Scale = 2</code>.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

int id = AddProduct("Tapis d'souris XXL", 19.90m, 50);
Console.WriteLine($"Produit créé avec l'Id {id}");

int AddProduct(string name, decimal price, int stock)
{
    using var connection = new SqlConnection(connectionString);
    connection.Open();
    using var command = new SqlCommand("""
        INSERT INTO Products (Name, Price, Stock)
        OUTPUT INSERTED.Id
        VALUES (@name, @price, @stock)
        """, connection);
    command.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = name;
    var p = command.Parameters.Add("@price", SqlDbType.Decimal);
    p.Precision = 10;
    p.Scale = 2;
    p.Value = price;
    command.Parameters.Add("@stock", SqlDbType.Int).Value = stock;
    return (int)command.ExecuteScalar()!;
}`
    },
    {
      level: "difficile",
      title: "Un tri choisi par l'utilisateur, en toute sécurité",
      prompt: `<p>L'utilisateur choisit la colonne de tri de la liste des produits en tapant <code>name</code>, <code>price</code> ou <code>stock</code>. Une colonne de tri ne peut pas être un paramètre : utilise un <code>switch</code> qui traduit le choix en nom de colonne autorisé (liste blanche), avec <code>Name</code> par défaut pour toute autre saisie. Affiche les produits triés.</p>`,
      hint: `<p><code>string column = choice switch { "price" =&gt; "Price", "stock" =&gt; "Stock", _ =&gt; "Name" };</code> Seule cette valeur, écrite par toi, est insérée dans le SQL.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Console.Write("Trier par (name, price, stock) : ");
string choice = (Console.ReadLine() ?? "").Trim().ToLowerInvariant();

// Liste blanche : la saisie ne va JAMAIS dans le SQL, seulement nos constantes
string column = choice switch
{
    "price" => "Price",
    "stock" => "Stock",
    _ => "Name"
};

using var connection = new SqlConnection(connectionString);
connection.Open();
using var command = new SqlCommand($"SELECT Name, Price, Stock FROM Products ORDER BY {column}", connection);
using var reader = command.ExecuteReader();
while (reader.Read())
    Console.WriteLine($"{reader.GetString(0)} - {reader.GetDecimal(1)} - {reader.GetInt32(2)}");`
    }
  ],
  quiz: [
    {
      q: `Pourquoi <code>$"SELECT … WHERE Email = '{email}'"</code> est-il dangereux ?`,
      options: ["Parce que l'interpolation est lente", "Parce que la saisie devient une partie du code SQL", "Il n'est pas dangereux, l'interpolation protège"],
      answer: 1,
      why: `L'interpolation fabrique une simple chaîne : la saisie y est collée comme avec <code>+</code>. Une apostrophe dans la saisie peut alors changer le sens de la requête. Le piège : croire que <code>$"…"</code> protège.`
    },
    {
      q: `Comment SQL Server traite-t-il la valeur d'un paramètre <code>@email</code> ?`,
      options: ["Comme une donnée, jamais comme du code SQL", "Comme du SQL, après avoir retiré les apostrophes", "Il l'insère dans le texte avant d'analyser la requête"],
      answer: 0,
      why: `Le texte SQL et les valeurs voyagent séparément. SQL Server analyse le texte, puis utilise la valeur comme une donnée. Il ne retire rien et ne recolle rien.`
    },
    {
      q: `Quel est l'inconvénient principal d'<code>AddWithValue</code> ?`,
      options: ["Il ne protège pas contre l'injection", "Il ne fonctionne qu'avec des chaînes", "Il devine le type SQL, ce qui peut gêner l'utilisation des index"],
      answer: 2,
      why: `<code>AddWithValue</code> protège bien contre l'injection, mais déduit le type de la valeur C#. Un mauvais type force des conversions côté serveur. <code>Add</code> avec le type de la colonne évite le problème.`
    },
    {
      q: `Comment passer « pas de valeur » (NULL) à un paramètre ?`,
      options: ["<code>.Value = null</code>", "<code>.Value = DBNull.Value</code>", "<code>.Value = \"NULL\"</code>"],
      answer: 1,
      why: `ADO.NET représente le <code>NULL</code> SQL par <code>DBNull.Value</code>. Avec le <code>null</code> C#, le paramètre est considéré comme sans valeur et la commande échoue. Le texte \"NULL\" serait enregistré tel quel, comme quatre lettres.`
    }
  ],
  project: `<p><strong>OrderFlow : des recherches paramétrées.</strong> Ajoute à <code>ProductData</code> trois méthodes, toutes avec <code>Parameters.Add</code> et des types explicites : <code>Product? GetById(int id)</code>, <code>List&lt;Product&gt; SearchByName(string text)</code> (avec <code>LIKE @pattern</code>) et <code>int Add(Product product)</code> qui renvoie l'Id via <code>OUTPUT INSERTED.Id</code>.</p>
<p>Ajoute à <code>CustomerData</code> une méthode <code>int? Add(string name, string email)</code> qui renvoie <code>null</code> si l'e-mail existe déjà (erreur 2627 ou 2601). Dans le menu, ajoute « 5. Rechercher un produit », « 6. Ajouter un produit » et « 7. Ajouter un client », qui lisent la saisie avec <code>Console.ReadLine()</code>. Teste chaque option avec une saisie qui contient une apostrophe.</p>`,
  resources: [
    { label: "Configurer les paramètres (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/framework/data/adonet/configuring-parameters-and-parameter-data-types" },
    { label: "Injection SQL (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/relational-databases/security/sql-injection" }
  ]
});

// =====================================================================
// ADO.NET : les bases — 6. Asynchrone
// =====================================================================
window.COURSE.push({
  key: "ado-async",
  title: "ADO.NET en asynchrone",
  summary: "Tu sauras écrire ton accès aux données en async avec OpenAsync, ExecuteReaderAsync et ReadAsync, libérer les ressources avec await using, et annuler une requête trop longue.",
  objectives: [
    "Comprendre pourquoi l'accès à la base doit être asynchrone",
    "Remplacer chaque méthode par sa version Async",
    "Utiliser await using pour libérer connexion, commande et lecteur",
    "Annuler une requête avec un CancellationToken"
  ],
  analogy: `<p>Pense à un <strong>serveur de restaurant</strong>. En version synchrone, il transmet ta commande en cuisine puis reste planté devant le passe, les bras croisés, jusqu'à ce que le plat soit prêt. Pendant ce temps, les autres tables attendent.</p>
<p>En version asynchrone, il transmet la commande, va servir d'autres tables, et revient quand la cuisine sonne. La cuisine n'a pas été plus rapide, mais le serveur a pu s'occuper de dix tables au lieu d'une. La base de données, c'est la cuisine. Ton thread, c'est le serveur.</p>`,
  lesson: `<h3>Pourquoi de l'async pour la base ?</h3>
<p>Quand ton programme envoie une requête à SQL Server, il passe l'essentiel du temps à <strong>attendre</strong> : le réseau, puis le serveur qui calcule, puis le réseau à nouveau. C'est ce qu'on appelle une opération d'<strong>entrée/sortie</strong> (I/O). En synchrone, le thread qui a lancé la requête reste bloqué pendant toute cette attente.</p>
<p>Dans une application console, ça ne se voit presque pas. Dans une <strong>API web</strong> (partie 4), chaque requête HTTP en cours occupe un thread : s'ils sont tous bloqués à attendre la base, le serveur ne peut plus répondre à personne alors que le processeur ne fait rien. Avec <code>await</code>, le thread est rendu pendant l'attente et sert d'autres requêtes.</p>
<p>Tu connais déjà le principe en TypeScript : <code>await firstValueFrom(this.http.get(url))</code> ne bloque pas le navigateur. Ici, c'est pareil côté serveur.</p>

<h3>Chaque méthode a sa version Async</h3>
<p>Bonne nouvelle : tu n'as rien de nouveau à apprendre. Chaque méthode que tu connais a une jumelle qui renvoie une <code>Task</code>, et il suffit d'ajouter <code>await</code> :</p>
<table>
<tr><th>Synchrone</th><th>Asynchrone</th><th>Renvoie</th></tr>
<tr><td><code>Open()</code></td><td><code>await OpenAsync()</code></td><td><code>Task</code></td></tr>
<tr><td><code>ExecuteNonQuery()</code></td><td><code>await ExecuteNonQueryAsync()</code></td><td><code>Task&lt;int&gt;</code></td></tr>
<tr><td><code>ExecuteScalar()</code></td><td><code>await ExecuteScalarAsync()</code></td><td><code>Task&lt;object?&gt;</code></td></tr>
<tr><td><code>ExecuteReader()</code></td><td><code>await ExecuteReaderAsync()</code></td><td><code>Task&lt;SqlDataReader&gt;</code></td></tr>
<tr><td><code>Read()</code></td><td><code>await ReadAsync()</code></td><td><code>Task&lt;bool&gt;</code></td></tr>
<tr><td><code>using</code></td><td><code>await using</code></td><td>appelle <code>DisposeAsync()</code></td></tr>
</table>
<div class="flow"><span>await OpenAsync</span><span>await ExecuteReaderAsync</span><span>await ReadAsync (boucle)</span><span>await using : DisposeAsync</span></div>

<h3>await using</h3>
<p><code>SqlConnection</code>, <code>SqlCommand</code> et <code>SqlDataReader</code> savent se libérer de façon asynchrone. Écris <code>await using var connection = …;</code> au lieu de <code>using var</code> : à la fin du bloc, C# appelle <code>DisposeAsync()</code> et l'attend sans bloquer le thread. Le comportement est le même que <code>using</code> : la connexion retourne au pool, même en cas d'exception.</p>
<p>Une méthode qui fait de l'accès aux données devient <code>async Task&lt;T&gt;</code>, et par convention son nom se termine par <code>Async</code> : <code>GetAllAsync</code>, <code>FindByEmailAsync</code>. Dans <code>Program.cs</code>, tu peux utiliser <code>await</code> directement au niveau supérieur.</p>

<h3>Annuler une requête trop longue</h3>
<p>Toutes ces méthodes acceptent un <code>CancellationToken</code> (un jeton d'annulation). Quand le jeton est annulé, ADO.NET demande à SQL Server d'interrompre la requête. Dans une API, ASP.NET Core te donne un jeton qui s'annule si le client ferme la page : inutile de continuer à calculer pour personne.</p>
<p>Pendant l'exécution d'une commande, SqlClient signale l'annulation par une <code>SqlException</code> (« opération annulée par l'utilisateur ») plutôt que par une <code>OperationCanceledException</code>. Pour la reconnaître de façon fiable, filtre avec <code>when (token.IsCancellationRequested)</code>.</p>
<div class="compare"><div><h4>CommandTimeout</h4><p>Délai fixe de la commande (30 s par défaut). Au-delà, <code>SqlException</code> avec <code>Number == -2</code>.</p></div><div><h4>CancellationToken</h4><p>Annulation décidée par ton code, à n'importe quel moment : délai choisi, bouton « Annuler », client parti.</p></div></div>

<h3>Les pièges à éviter</h3>
<p><strong>Ne bloque jamais sur une tâche</strong> avec <code>.Result</code> ou <code>.Wait()</code> : tu perds tout le bénéfice, et dans certains contextes tu provoques un blocage complet. Une fois en async, reste en async jusqu'en haut : on dit « async all the way ».</p>
<p><strong>Une connexion n'exécute qu'une commande à la fois.</strong> Lancer deux requêtes en parallèle avec <code>Task.WhenAll</code> sur la même connexion provoque une erreur. Pour du parallélisme, chaque tâche ouvre sa propre connexion (le pool rend ça peu coûteux).</p>
<div class="tip">Ne mélange pas : si ta méthode est <code>async</code>, utilise <code>ReadAsync</code> dans la boucle, pas <code>Read</code>. Un seul appel synchrone au milieu bloque le thread exactement comme avant.</div>
<div class="note">Dans une API ASP.NET Core, propage toujours le <code>CancellationToken</code> de l'action jusqu'à ton accès aux données (<code>GetAllAsync(ct)</code>). C'est un paramètre de plus dans chaque signature, mais c'est ce qui permet au serveur d'arrêter le travail inutile sous forte charge. Dapper et EF Core acceptent ce même jeton.</div>`,
  examples: [
    {
      title: "Les versions Async pas à pas",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

await using var count = new SqlCommand("SELECT COUNT(*) FROM Orders", connection);
int orders = (int)(await count.ExecuteScalarAsync())!;
Console.WriteLine($"Commandes : {orders}");

await using var list = new SqlCommand(
    "SELECT Id, Status FROM Orders ORDER BY Id", connection);
await using var reader = await list.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    Console.WriteLine($"Commande {reader.GetInt32(0)} : {reader.GetString(1)}");
}`,
      output: `Commandes : 5
Commande 1 : Shipped
Commande 2 : Pending
Commande 3 : Shipped
Commande 4 : Paid
Commande 5 : Cancelled`,
      steps: [
        "<code>await using var connection = …</code> : la connexion sera libérée avec <code>DisposeAsync()</code> à la fin du programme.",
        "<code>await connection.OpenAsync();</code> : l'ouverture ne bloque plus le thread pendant l'échange avec le serveur.",
        "<code>(int)(await count.ExecuteScalarAsync())!</code> : on attend d'abord la tâche (entre parenthèses), puis on caste l'<code>object?</code> obtenu.",
        "<code>await list.ExecuteReaderAsync()</code> : renvoie le <code>SqlDataReader</code>, lui aussi libéré avec <code>await using</code>.",
        "<code>while (await reader.ReadAsync())</code> : chaque passage à la ligne suivante peut attendre des données du réseau, donc on l'attend aussi.",
        "<code>reader.GetInt32(0)</code> : la lecture d'une colonne reste synchrone, la ligne est déjà en mémoire. La commande 1 est <code>Shipped</code> depuis l'exemple sur ExecuteNonQuery."
      ]
    },
    {
      title: "Une classe d'accès aux données asynchrone",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var data = new CustomerData(connectionString);
Customer? alice = await data.FindByEmailAsync("alice@example.com");
Customer? nobody = await data.FindByEmailAsync("zoe@example.com");
Console.WriteLine(alice?.ToString() ?? "introuvable");
Console.WriteLine(nobody?.ToString() ?? "introuvable");

record Customer(int Id, string Name, string Email);

class CustomerData(string connectionString)
{
    public async Task<Customer?> FindByEmailAsync(string email, CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new SqlCommand(
            "SELECT Id, Name, Email FROM Customers WHERE Email = @email", connection);
        command.Parameters.Add("@email", SqlDbType.NVarChar, 200).Value = email;

        await using var reader = await command.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
            return null; // aucune ligne
        return new Customer(reader.GetInt32(0), reader.GetString(1), reader.GetString(2));
    }
}`,
      output: `Customer { Id = 1, Name = Alice Martin, Email = alice@example.com }
introuvable`,
      steps: [
        "<code>class CustomerData(string connectionString)</code> : un constructeur principal. La chaîne est disponible dans toutes les méthodes de la classe.",
        "<code>async Task&lt;Customer?&gt; FindByEmailAsync(…, CancellationToken ct = default)</code> : la méthode renvoie une tâche, se termine par <code>Async</code> et accepte un jeton optionnel.",
        "<code>OpenAsync(ct)</code>, <code>ExecuteReaderAsync(ct)</code>, <code>ReadAsync(ct)</code> : le même jeton est transmis à chaque appel.",
        "<code>if (!await reader.ReadAsync(ct)) return null;</code> : pas de ligne, pas de client. Les <code>await using</code> ferment tout en sortant.",
        "<code>alice?.ToString() ?? \"introuvable\"</code> : un record a un <code>ToString</code> lisible, d'où l'affichage <code>Customer { Id = 1, … }</code>."
      ],
      explain: "C'est déjà la forme d'un repository, que tu formaliseras au chapitre suivant : une classe, des méthodes Async, un CancellationToken."
    },
    {
      title: "Annuler une requête trop longue",
      code: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

// Une requête lente : SQL Server attend 5 secondes
await using var command = new SqlCommand("WAITFOR DELAY '00:00:05'", connection);

// On abandonne au bout d'une seconde
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1));
try
{
    await command.ExecuteNonQueryAsync(cts.Token);
    Console.WriteLine("Terminé");
}
catch (SqlException ex) when (cts.IsCancellationRequested)
{
    Console.WriteLine($"Requête annulée ({ex.GetType().Name})");
}`,
      output: `Requête annulée (SqlException)`,
      steps: [
        "<code>WAITFOR DELAY '00:00:05'</code> : une instruction T-SQL qui attend 5 secondes. Parfait pour simuler une requête lente.",
        "<code>new CancellationTokenSource(TimeSpan.FromSeconds(1))</code> : une source d'annulation qui s'annule toute seule après une seconde.",
        "<code>ExecuteNonQueryAsync(cts.Token)</code> : on passe le jeton. Au bout d'une seconde, SqlClient demande au serveur d'arrêter la requête.",
        "<code>catch (SqlException ex) when (cts.IsCancellationRequested)</code> : SqlClient signale l'annulation par une <code>SqlException</code>. Le filtre <code>when</code> vérifie que c'est bien notre annulation, et pas une autre erreur SQL.",
        "Le programme affiche le message après environ 1 seconde au lieu de 5."
      ],
      explain: "Avec command.CommandTimeout = 1 à la place du jeton, tu obtiendrais aussi une SqlException, avec ex.Number == -2 (délai dépassé)."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter en async",
      prompt: `<p>Réécris le programme « compter les produits » en version asynchrone : <code>await using</code>, <code>OpenAsync</code> et <code>ExecuteScalarAsync</code>.</p>`,
      hint: `<p>Attention aux parenthèses : <code>(int)(await command.ExecuteScalarAsync())!</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

await using var command = new SqlCommand("SELECT COUNT(*) FROM Products", connection);
int count = (int)(await command.ExecuteScalarAsync())!;
Console.WriteLine($"Nombre de produits : {count}");`
    },
    {
      level: "moyen",
      title: "Charger les produits en async",
      prompt: `<p>Écris une fonction <code>async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync(CancellationToken ct)</code> qui lit tous les produits avec <code>ExecuteReaderAsync</code> et <code>ReadAsync</code>, et renvoie une liste de <code>record Product(int Id, string Name, decimal Price, int Stock)</code>. Appelle-la avec <code>CancellationToken.None</code> et affiche le nom des produits.</p>`,
      hint: `<p>Une fonction locale peut être <code>async</code> : <code>async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync(CancellationToken ct) { … }</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var products = await GetProductsAsync(CancellationToken.None);
foreach (var p in products)
    Console.WriteLine(p.Name);

async Task<List<Product>> GetProductsAsync(CancellationToken ct)
{
    var result = new List<Product>();
    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync(ct);
    await using var command = new SqlCommand("SELECT Id, Name, Price, Stock FROM Products", connection);
    await using var reader = await command.ExecuteReaderAsync(ct);
    while (await reader.ReadAsync(ct))
    {
        result.Add(new Product(reader.GetInt32(0), reader.GetString(1),
                               reader.GetDecimal(2), reader.GetInt32(3)));
    }
    return result;
}

record Product(int Id, string Name, decimal Price, int Stock);`
    },
    {
      level: "difficile",
      title: "Trois requêtes en parallèle",
      prompt: `<p>Écris une fonction <code>async Task&lt;int&gt; CountAsync(string table)</code> qui ouvre <strong>sa propre connexion</strong> et renvoie le nombre de lignes d'une table. Lance-la pour <code>Products</code>, <code>Customers</code> et <code>Orders</code> en même temps avec <code>Task.WhenAll</code>, puis affiche les trois résultats. Le nom de table ne pouvant pas être un paramètre, vérifie-le contre une liste blanche.</p>`,
      hint: `<p>Lance les trois tâches sans <code>await</code>, puis <code>int[] counts = await Task.WhenAll(t1, t2, t3);</code>. Chaque tâche a sa connexion : c'est ce qui rend le parallélisme possible.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

string[] allowed = ["Products", "Customers", "Orders"];

Task<int> products = CountAsync("Products");
Task<int> customers = CountAsync("Customers");
Task<int> orders = CountAsync("Orders");

int[] counts = await Task.WhenAll(products, customers, orders);
Console.WriteLine($"Produits : {counts[0]}, clients : {counts[1]}, commandes : {counts[2]}");

async Task<int> CountAsync(string table)
{
    if (!allowed.Contains(table))
        throw new ArgumentException($"Table non autorisée : {table}");

    // Une connexion par tâche : une connexion n'exécute qu'une commande à la fois
    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    await using var command = new SqlCommand($"SELECT COUNT(*) FROM {table}", connection);
    return (int)(await command.ExecuteScalarAsync())!;
}`
    }
  ],
  quiz: [
    {
      q: `Que gagne-t-on vraiment avec <code>await ExecuteReaderAsync()</code> ?`,
      options: ["La requête s'exécute plus vite sur SQL Server", "Le thread n'est pas bloqué pendant l'attente et peut servir autre chose", "On peut lire les lignes dans le désordre"],
      answer: 1,
      why: `L'async ne rend pas la base plus rapide : il libère le thread pendant l'attente. Dans une API, cela permet de traiter beaucoup plus de requêtes en même temps avec les mêmes ressources.`
    },
    {
      q: `Quelle est la version asynchrone de <code>using var reader = command.ExecuteReader();</code> ?`,
      options: ["<code>await using var reader = await command.ExecuteReaderAsync();</code>", "<code>using var reader = command.ExecuteReaderAsync();</code>", "<code>var reader = command.ExecuteReaderAsync().Result;</code>"],
      answer: 0,
      why: `Il faut attendre la tâche avec <code>await</code> et libérer avec <code>await using</code>. Sans <code>await</code>, on obtient une <code>Task</code> et non un lecteur. <code>.Result</code> bloque le thread : c'est justement ce qu'on veut éviter.`
    },
    {
      q: `Pendant un <code>ExecuteNonQueryAsync</code>, le <code>CancellationToken</code> est annulé. Quelle exception reçois-tu ?`,
      options: ["<code>TimeoutException</code>", "<code>OperationCanceledException</code>, toujours", "Une <code>SqlException</code>, qu'on reconnaît avec <code>when (token.IsCancellationRequested)</code>"],
      answer: 2,
      why: `SqlClient lève une <code>SqlException</code> « opération annulée ». Le filtre sur <code>IsCancellationRequested</code> permet de la distinguer des autres erreurs SQL. Le piège : attendre une <code>OperationCanceledException</code> comme avec d'autres API.`
    },
    {
      q: `Pourquoi ne pas lancer deux requêtes en parallèle sur la même connexion ?`,
      options: ["Parce qu'une connexion n'exécute qu'une commande à la fois", "Parce que le pool l'interdit", "On peut, c'est même recommandé"],
      answer: 0,
      why: `Une connexion est un seul canal : une deuxième commande pendant que la première tourne provoque une erreur. Pour paralléliser, chaque tâche ouvre sa propre connexion, que le pool fournit à faible coût.`
    }
  ],
  project: `<p><strong>OrderFlow : tout en asynchrone.</strong> Convertis <code>ProductData</code> et <code>CustomerData</code> : <code>GetAllAsync</code>, <code>GetByIdAsync</code>, <code>SearchByNameAsync</code>, <code>AddAsync</code>, chacune avec un paramètre <code>CancellationToken ct = default</code> transmis à <code>OpenAsync</code>, <code>ExecuteReaderAsync</code>, <code>ReadAsync</code>… Remplace tous les <code>using</code> par <code>await using</code> et vérifie qu'il ne reste aucun <code>Open()</code>, <code>Read()</code> ni <code>Execute…()</code> synchrone.</p>
<p>Dans <code>Program.cs</code>, appelle les méthodes avec <code>await</code> dans la boucle du menu, et transforme <code>Db.CanConnect()</code> en <code>Db.CanConnectAsync()</code>. Bonus : pour l'option « Statistiques », lance les trois comptages en parallèle avec <code>Task.WhenAll</code>, chacun avec sa propre connexion. Ta console est prête pour la suite : transactions, puis repositories et Dapper.</p>`,
  resources: [
    { label: "Programmation asynchrone avec SqlClient (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/asynchronous-programming" },
    { label: "Programmation asynchrone avec async et await (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/" }
  ]
});
