window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 2 - SQL Server pour développeurs
// 1. Installer SQL Server (LocalDB ou Docker) et s'y connecter
// =====================================================================
window.COURSE.push({
  key: "sql-install",
  title: "Installer SQL Server (LocalDB ou Docker) et s'y connecter",
  summary: "Tu sauras installer SQL Server sur ton poste, t'y connecter avec un outil et créer la base OrderFlow.",
  objectives: [
    "Comprendre ce qu'est un serveur, une base et une table",
    "Choisir entre LocalDB et SQL Server dans Docker",
    "Te connecter avec SSMS, VS Code ou sqlcmd et lancer une requête",
    "Créer la base OrderFlow et lire une chaîne de connexion"
  ],
  analogy: `<p>Pense à une <strong>bibliothèque municipale</strong>. Le bâtiment, c'est le <strong>serveur</strong> SQL Server : il est ouvert, il a un gardien et une adresse. À l'intérieur, chaque salle est une <strong>base de données</strong> (une salle « OrderFlow », une salle « Compta »…). Dans chaque salle, des <strong>étagères</strong> bien étiquetées : ce sont les <strong>tables</strong>.</p>
<p>Pour entrer, il te faut l'adresse du bâtiment, le nom de la salle et un badge : c'est exactement ce que contient une <strong>chaîne de connexion</strong>.</p>`,
  lesson: `<h3>SQL Server, c'est quoi ?</h3>
<p>SQL Server est le <strong>système de gestion de base de données</strong> de Microsoft (on dit SGBD). C'est un programme qui tourne en permanence, range tes données sur le disque et répond aux questions qu'on lui pose. Ces questions s'écrivent en <strong>SQL</strong>, un langage fait pour lire et écrire des données. La variante de SQL propre à SQL Server s'appelle <strong>T-SQL</strong> (Transact-SQL).</p>
<p>Côté front, tu appelles une API avec <code>HttpClient</code>. Ici, c'est pareil un cran plus bas : ton API C# enverra des requêtes SQL au serveur et recevra des lignes en retour.</p>
<pre class="diagram">
 Serveur SQL Server  (le bâtiment)
 +---------------------------------------+
 |  Base OrderFlow        Base master    |
 |  +-----------------+   +-----------+  |
 |  | Customers       |   | (système) |  |
 |  | Products        |   +-----------+  |
 |  | Orders          |                  |
 |  | OrderLines      |                  |
 |  +-----------------+                  |
 +---------------------------------------+
</pre>
<p>La base <code>master</code> existe toujours : SQL Server y range sa propre configuration. Tu n'y crées jamais tes tables.</p>

<h3>Deux façons simples de l'installer</h3>
<div class="compare"><div><h4>LocalDB (Windows)</h4><p>Une petite version de SQL Server qui démarre toute seule quand on s'y connecte. Elle est installée avec Visual Studio (charge de travail « Développement web »), ou avec l'installeur SQL Server Express en choisissant « LocalDB ». Nom du serveur : <code>(localdb)\\MSSQLLocalDB</code>. Connexion avec ton compte Windows.</p></div><div><h4>Docker (Windows, Mac, Linux)</h4><p>Un vrai SQL Server dans un conteneur, le plus proche de la production. Tu le lances en une commande et tu le supprimes en une autre. Nom du serveur : <code>localhost</code> (port 1433). Connexion avec l'utilisateur <code>sa</code> et un mot de passe.</p></div></div>
<p>Pour Docker, une seule commande suffit (Docker Desktop doit être lancé) :</p>
<pre class="diagram">
docker run -e "ACCEPT_EULA=Y"
  -e "MSSQL_SA_PASSWORD=OrderFlow_Dev_2026!"
  -p 1433:1433 --name orderflow-sql
  -d mcr.microsoft.com/mssql/server:2022-latest
</pre>
<p>Tape-la sur une seule ligne. Le mot de passe doit être complexe (8 caractères minimum avec majuscules, minuscules, chiffres et symboles), sinon le conteneur s'arrête tout seul. En cas de doute : <code>docker logs orderflow-sql</code>.</p>
<div class="tip">Si <code>docker ps</code> ne montre pas ton conteneur, c'est presque toujours le mot de passe. Supprime le conteneur avec <code>docker rm orderflow-sql</code> et relance avec un mot de passe plus fort.</div>

<h3>Les outils pour se connecter</h3>
<table>
<tr><th>Outil</th><th>Pour quoi faire</th></tr>
<tr><td><strong>SSMS</strong> (SQL Server Management Studio)</td><td>L'outil de référence sous Windows : explorateur de tables, éditeur, plans d'exécution graphiques.</td></tr>
<tr><td><strong>Extension « SQL Server (mssql) » de VS Code</strong></td><td>Multiplateforme, parfaite pour écrire et lancer des scripts à côté de ton code.</td></tr>
<tr><td><strong>sqlcmd</strong></td><td>La ligne de commande. Pratique pour lancer un script, et c'est lui qui produit les sorties de ce cours.</td></tr>
</table>
<p>Dans chaque outil, tu donnes le <strong>nom du serveur</strong>, le <strong>mode d'authentification</strong> (Windows pour LocalDB, SQL avec <code>sa</code> pour Docker) et tu coches « Faire confiance au certificat du serveur » : en local, le certificat est auto-signé.</p>
<div class="flow"><span>Lancer le serveur</span><span>Ouvrir l'outil</span><span>Se connecter</span><span>Écrire du SQL</span><span>Exécuter</span></div>

<h3>Lancer ta première requête</h3>
<p>Une requête de lecture commence par <code>SELECT</code>. Elle peut même calculer sans aucune table : <code>SELECT 6 * 7;</code>. Le résultat revient toujours sous forme de <strong>tableau</strong> : des colonnes avec un nom, et des lignes. Le <code>;</code> final est facultatif en T-SQL, mais c'est une bonne habitude.</p>
<p>Dans un script, le mot <code>GO</code> découpe le texte en <strong>lots</strong> (en anglais <em>batches</em>) envoyés l'un après l'autre. Ce n'est pas du SQL : c'est une consigne pour SSMS, VS Code et sqlcmd. Tu ne l'enverras donc jamais depuis du C#.</p>

<h3>La chaîne de connexion</h3>
<p>Ton code C# trouvera le serveur grâce à une <strong>chaîne de connexion</strong> : une suite de paires <code>clé=valeur</code> séparées par des <code>;</code>. Dans la suite du cours, on utilise :</p>
<pre class="diagram">
Server=localhost;Database=OrderFlow;
Trusted_Connection=True;
TrustServerCertificate=True
</pre>
<p>(Dans ton code, tout tient sur une seule ligne.)</p>
<p><code>Server</code> : où est le serveur. <code>Database</code> : quelle base. <code>Trusted_Connection=True</code> : « connecte-moi avec mon compte Windows ». <code>TrustServerCertificate=True</code> : accepter le certificat auto-signé, uniquement en développement. Avec LocalDB, remplace <code>localhost</code> par <code>(localdb)\\MSSQLLocalDB</code>. Avec Docker, remplace <code>Trusted_Connection=True</code> par <code>User Id=sa;Password=…</code>.</p>
<div class="note">Une chaîne de connexion avec un mot de passe ne se commite jamais dans Git. En .NET, on la range dans <code>appsettings.Development.json</code> exclu du dépôt ou, mieux, dans les <em>user secrets</em> (<code>dotnet user-secrets</code>). En production, elle vient de variables d'environnement ou d'un coffre comme Azure Key Vault.</div>`,
  examples: [
    {
      title: "Ta première requête, sans table",
      code: `-- Ta première requête : pas besoin de table pour calculer
SELECT N'Bonjour SQL Server' AS Message,
       6 * 7                AS Answer,
       DB_NAME()            AS CurrentDatabase;`,
      output: `Message            | Answer | CurrentDatabase
-------------------+--------+----------------
Bonjour SQL Server | 42     | master

(1 rows affected)`,
      steps: [
        "<code>-- Ta première requête…</code> : deux tirets commencent un commentaire, comme <code>//</code> en C#.",
        "<code>SELECT N'Bonjour SQL Server' AS Message</code> : une chaîne s'écrit entre apostrophes simples. Le <code>N</code> devant signifie « texte Unicode », on y revient à la leçon suivante. <code>AS Message</code> donne un nom à la colonne.",
        "<code>6 * 7 AS Answer</code> : SQL sait calculer. Chaque expression séparée par une virgule devient une colonne.",
        "<code>DB_NAME() AS CurrentDatabase</code> : une fonction qui renvoie le nom de la base où tu es connecté. Juste après la connexion, c'est <code>master</code>.",
        "<code>(1 rows affected)</code> : sqlcmd indique le nombre de lignes renvoyées (en anglais, et sans accorder « row »)."
      ],
      explain: "Le résultat d'un SELECT est toujours un tableau, même pour une seule valeur."
    },
    {
      title: "Créer la base OrderFlow",
      code: `-- Crée la base OrderFlow seulement si elle n'existe pas encore
IF DB_ID('OrderFlow') IS NULL
    CREATE DATABASE OrderFlow;
GO
-- Vérifie qu'elle est bien là et en ligne
SELECT name, state_desc
FROM sys.databases
WHERE name = 'OrderFlow';`,
      output: `name      | state_desc
----------+-----------
OrderFlow | ONLINE

(1 rows affected)`,
      steps: [
        "<code>IF DB_ID('OrderFlow') IS NULL</code> : <code>DB_ID</code> renvoie l'identifiant de la base, ou <code>NULL</code> si elle n'existe pas. On teste <code>IS NULL</code> (jamais <code>= NULL</code>).",
        "<code>CREATE DATABASE OrderFlow;</code> : crée la base avec les réglages par défaut. Grâce au <code>IF</code>, tu peux relancer le script sans erreur.",
        "<code>GO</code> : termine le premier lot. Le lot suivant voit bien la nouvelle base.",
        "<code>FROM sys.databases</code> : une vue système qui liste toutes les bases du serveur.",
        "<code>WHERE name = 'OrderFlow'</code> : on ne garde que la ligne de notre base. <code>ONLINE</code> veut dire qu'elle est prête."
      ]
    },
    {
      title: "Se connecter avec sqlcmd en ligne de commande",
      code: `sqlcmd -S "(localdb)\\MSSQLLocalDB" -d OrderFlow -W -Q "SELECT DB_NAME() AS CurrentDatabase, CAST(SERVERPROPERTY('Edition') AS nvarchar(50)) AS Edition"`,
      output: `CurrentDatabase Edition
--------------- -------
OrderFlow Express Edition (64-bit)

(1 rows affected)`,
      steps: [
        "<code>-S \"(localdb)\\MSSQLLocalDB\"</code> : le serveur. Avec Docker, ce serait <code>-S localhost -U sa -P \"ton mot de passe\"</code>.",
        "<code>-d OrderFlow</code> : la base à utiliser dès la connexion, au lieu de <code>master</code>.",
        "<code>-W</code> : retire les espaces de remplissage, sinon chaque colonne texte fait des dizaines de caractères de large.",
        "<code>-Q \"…\"</code> : exécute la requête puis quitte. Pour lancer un fichier, utilise <code>-i script.sql</code>.",
        "<code>SERVERPROPERTY('Edition')</code> : l'édition du serveur. LocalDB répond « Express Edition », Docker répond « Developer Edition »."
      ],
      explain: "Sans -Q ni -i, sqlcmd ouvre une invite interactive : tape ta requête, puis GO et Entrée pour l'exécuter, et exit pour sortir."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une calculatrice SQL",
      prompt: `<p>Connecte-toi au serveur et écris une seule requête <code>SELECT</code> qui renvoie trois colonnes : <code>PriceWithTax</code> (89,90 multiplié par 1,20), <code>UpperName</code> (le texte « orderflow » en majuscules) et <code>NameLength</code> (la longueur du texte « OrderFlow »).</p>`,
      hint: `<p>En SQL, le séparateur décimal est le point : <code>89.90</code>. Les fonctions utiles s'appellent <code>UPPER</code> et <code>LEN</code>.</p>`,
      solution: `SELECT 89.90 * 1.20       AS PriceWithTax,   -- 107.8800
       UPPER(N'orderflow') AS UpperName,      -- ORDERFLOW
       LEN(N'OrderFlow')   AS NameLength;     -- 9`
    },
    {
      level: "moyen",
      title: "Une base jetable",
      prompt: `<p>Écris un script qui crée une base <code>PlayGround</code>, vérifie dans <code>sys.databases</code> qu'elle existe, la supprime avec <code>DROP DATABASE</code>, puis vérifie qu'elle a disparu (le <code>COUNT(*)</code> doit valoir 0). Sépare les étapes avec <code>GO</code>.</p>`,
      hint: `<p><code>SELECT COUNT(*) FROM sys.databases WHERE name = 'PlayGround';</code> compte les bases qui portent ce nom.</p>`,
      solution: `CREATE DATABASE PlayGround;
GO
SELECT name, state_desc FROM sys.databases WHERE name = 'PlayGround';
GO
DROP DATABASE PlayGround;
GO
SELECT COUNT(*) AS StillThere FROM sys.databases WHERE name = 'PlayGround'; -- 0`
    },
    {
      level: "difficile",
      title: "Un script lancé par sqlcmd",
      prompt: `<p>Crée un fichier <code>check.sql</code> qui affiche le nom de la base courante et la liste de toutes les bases du serveur triées par nom. Lance-le avec <code>sqlcmd</code> directement dans la base OrderFlow, en sortie compacte. Bonus : écris la variante de la commande pour un SQL Server dans Docker.</p>`,
      hint: `<p>Les options utiles : <code>-S</code> (serveur), <code>-d</code> (base), <code>-W</code> (compact), <code>-i</code> (fichier). Pour Docker, ajoute <code>-U sa -P …</code> et <code>-C</code> pour faire confiance au certificat.</p>`,
      solution: `-- Fichier : check.sql
SELECT DB_NAME() AS CurrentDatabase;
SELECT name FROM sys.databases ORDER BY name;

-- Commande avec LocalDB :
-- sqlcmd -S "(localdb)\\MSSQLLocalDB" -d OrderFlow -W -i check.sql

-- Commande avec Docker :
-- sqlcmd -S localhost -U sa -P "OrderFlow_Dev_2026!" -C -d OrderFlow -W -i check.sql`
    }
  ],
  quiz: [
    {
      q: `Dans la hiérarchie de SQL Server, que contient directement une <strong>base de données</strong> ?`,
      options: ["Des serveurs", "Des tables", "Des chaînes de connexion"],
      answer: 1,
      why: `Un serveur contient des bases, et une base contient des tables (plus d'autres objets comme les index). La chaîne de connexion, elle, vit dans ton application.`
    },
    {
      q: `À quoi sert le mot <code>GO</code> dans un script ?`,
      options: ["C'est une instruction T-SQL qui valide les modifications", "Il découpe le script en lots pour l'outil (SSMS, VS Code, sqlcmd)", "Il démarre le serveur"],
      answer: 1,
      why: `<code>GO</code> n'est pas du T-SQL : c'est un séparateur compris par les outils. Le piège : le confondre avec <code>COMMIT</code>, qui valide une transaction.`
    },
    {
      q: `Quel nom de serveur utilises-tu pour te connecter à LocalDB ?`,
      options: ["<code>localhost,1433</code>", "<code>master</code>", "<code>(localdb)\\MSSQLLocalDB</code>"],
      answer: 2,
      why: `LocalDB s'adresse par <code>(localdb)\\MSSQLLocalDB</code>. <code>localhost,1433</code> sert pour Docker ou un SQL Server installé comme service. <code>master</code> est une base, pas un serveur.`
    },
    {
      q: `Que signifie <code>Trusted_Connection=True</code> dans une chaîne de connexion ?`,
      options: ["Se connecter avec son compte Windows", "Faire confiance au certificat du serveur", "Autoriser toutes les requêtes"],
      answer: 0,
      why: `<code>Trusted_Connection=True</code> active l'authentification Windows. La confiance dans le certificat, c'est <code>TrustServerCertificate=True</code> : deux réglages différents.`
    }
  ],
  project: `<p><strong>OrderFlow : la base existe.</strong> Installe SQL Server (LocalDB ou Docker) et connecte-toi avec l'outil de ton choix. Crée un dossier <code>database/</code> à la racine de ton dépôt OrderFlow et enregistre-y <code>00-create-database.sql</code> avec le script de l'exemple 2. Exécute-le, puis note dans un fichier <code>README.md</code> du dossier la chaîne de connexion adaptée à ton installation (sans mot de passe en clair).</p>`,
  resources: [
    { label: "SQL Server Express LocalDB (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/database-engine/configure-windows/sql-server-express-localdb" },
    { label: "Démarrage rapide : SQL Server dans Docker (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/linux/quickstart-install-connect-docker" }
  ]
});

// =====================================================================
// 2. Tables, types de colonnes et clés
// =====================================================================
window.COURSE.push({
  key: "sql-tables",
  title: "Tables, types de colonnes et clés",
  summary: "Tu sauras créer les quatre tables d'OrderFlow avec les bons types, les clés et les contraintes, puis les remplir avec le jeu de données de départ.",
  objectives: [
    "Écrire un CREATE TABLE avec des types adaptés",
    "Poser une clé primaire auto-incrémentée et des clés étrangères",
    "Protéger les données avec NOT NULL, UNIQUE, CHECK et DEFAULT",
    "Charger le jeu de données de départ réutilisé dans tout le chapitre"
  ],
  analogy: `<p>Une table, c'est un <strong>tableau Excel très strict</strong>. Chaque colonne a un en-tête et un type imposé : impossible de taper « abc » dans la colonne Prix. Chaque ligne a un <strong>numéro unique</strong> qui ne change jamais : la clé primaire.</p>
<p>Et quand la feuille « Commandes » écrit « client n° 2 », la base vérifie que le client n° 2 existe vraiment dans la feuille « Clients ». C'est la clé étrangère : un lien qu'on ne peut pas casser par erreur.</p>`,
  lesson: `<h3>Une table, des colonnes, des lignes</h3>
<p>Une <strong>table</strong> range des données du même genre : les clients, les produits… Elle est définie par ses <strong>colonnes</strong> (nom + type) et contient des <strong>lignes</strong> (une par client, une par produit). On la crée avec <code>CREATE TABLE</code>, en listant les colonnes entre parenthèses.</p>
<p>C'est très proche d'une interface TypeScript : <code>interface Product { id: number; name: string; price: number }</code>. La différence : la base <em>refuse</em> réellement une donnée qui ne respecte pas la définition.</p>

<h3>Choisir le type de chaque colonne</h3>
<table>
<tr><th>Besoin</th><th>Type SQL Server</th><th>Type C#</th><th>À savoir</th></tr>
<tr><td>Nombre entier</td><td><code>INT</code></td><td><code>int</code></td><td><code>BIGINT</code> au-delà de 2 milliards.</td></tr>
<tr><td>Texte</td><td><code>NVARCHAR(100)</code></td><td><code>string</code></td><td>Le <code>N</code> = Unicode (accents, emojis). 100 = longueur maximale.</td></tr>
<tr><td>Montant</td><td><code>DECIMAL(10,2)</code></td><td><code>decimal</code></td><td>10 chiffres dont 2 après la virgule. Jamais <code>FLOAT</code> pour de l'argent.</td></tr>
<tr><td>Date et heure</td><td><code>DATETIME2(0)</code></td><td><code>DateTime</code></td><td>Le <code>(0)</code> = à la seconde près, sans fractions.</td></tr>
<tr><td>Vrai / faux</td><td><code>BIT</code></td><td><code>bool</code></td><td>On écrit 1 et 0, pas true et false.</td></tr>
</table>
<p>Pour écrire un texte Unicode dans une requête, on préfixe la chaîne par <code>N</code> : <code>N'Chloé'</code>. Sans le <code>N</code>, certains caractères peuvent être perdus.</p>

<h3>NULL ou NOT NULL</h3>
<p>En SQL, <code>NULL</code> veut dire « valeur inconnue ». Par défaut, une colonne l'accepte. Écris <code>NOT NULL</code> dès qu'une valeur est obligatoire : un client sans nom n'a pas de sens. Côté C#, une colonne <code>NOT NULL</code> devient un <code>string</code>, une colonne nullable un <code>string?</code>.</p>

<h3>Les clés</h3>
<p>La <strong>clé primaire</strong> (<code>PRIMARY KEY</code>) identifie chaque ligne de façon unique. Avec <code>IDENTITY(1,1)</code>, SQL Server la remplit tout seul : 1, 2, 3… Tu ne fournis jamais l'<code>Id</code> à l'insertion.</p>
<p>La <strong>clé étrangère</strong> (<code>REFERENCES</code>) relie deux tables. <code>Orders.CustomerId REFERENCES Customers(Id)</code> garantit qu'une commande pointe toujours vers un client qui existe.</p>
<pre class="diagram">
 Customers  (Id PK, Name, Email, CreatedAt)
     | 1 client
     | n commandes
 Orders     (Id PK, CustomerId FK, OrderDate,
             Status)
     | 1 commande
     | n lignes
 OrderLines (Id PK, OrderId FK, ProductId FK,
             Quantity, UnitPrice)
     | n lignes
     | 1 produit
 Products   (Id PK, Name, Price, Stock)
</pre>
<p>Un client a plusieurs commandes, une commande a plusieurs lignes, et chaque ligne désigne un produit. On dit « relation un-à-plusieurs ».</p>

<h3>Les contraintes qui protègent tes données</h3>
<div class="flow"><span>NOT NULL : obligatoire</span><span>UNIQUE : pas de doublon</span><span>CHECK : règle simple</span><span>DEFAULT : valeur par défaut</span></div>
<p><code>UNIQUE</code> empêche deux clients d'avoir le même email. <code>CHECK (Price &gt;= 0)</code> refuse un prix négatif. <code>DEFAULT SYSUTCDATETIME()</code> remplit la date toute seule si tu ne la donnes pas. On nomme chaque contrainte (<code>CONSTRAINT UQ_Customers_Email</code>) : ce nom apparaît dans le message d'erreur, ce qui aide énormément à comprendre ce qui a été refusé.</p>
<div class="tip">Les tables enfants se suppriment avant les parents. <code>DROP TABLE IF EXISTS OrderLines, Orders, Products, Customers;</code> marche dans cet ordre, pas dans l'ordre inverse : on ne peut pas supprimer <code>Customers</code> tant que <code>Orders</code> pointe vers elle.</div>

<h3>Le jeu de données de départ</h3>
<p>Toutes les leçons suivantes utilisent les mêmes données : 4 clients, 6 produits, 5 commandes, 8 lignes. Elles sont dans le script <code>02-seed.sql</code> (exemple 2). Pour repartir de zéro à tout moment, relance <code>01-schema.sql</code> puis <code>02-seed.sql</code> : les tables sont recréées et les <code>Id</code> repartent de 1.</p>
<div class="note">Une règle qui doit être vraie quoi qu'il arrive (unicité, lien, valeur positive) va dans la base sous forme de contrainte, en plus de la validation dans ton API. La validation C# donne un joli message ; la contrainte protège les données même quand deux requêtes arrivent en même temps ou qu'un script écrit directement dans la table.</div>`,
  examples: [
    {
      title: "Le schéma OrderFlow (01-schema.sql)",
      code: `-- 01-schema.sql : crée (ou recrée) les quatre tables d'OrderFlow
USE OrderFlow;
DROP TABLE IF EXISTS OrderLines, Orders, Products, Customers;

CREATE TABLE Customers (
    Id        INT IDENTITY(1,1) CONSTRAINT PK_Customers PRIMARY KEY,
    Name      NVARCHAR(100) NOT NULL,
    Email     NVARCHAR(200) NOT NULL CONSTRAINT UQ_Customers_Email UNIQUE,
    CreatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_Customers_CreatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Products (
    Id    INT IDENTITY(1,1) CONSTRAINT PK_Products PRIMARY KEY,
    Name  NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL CONSTRAINT CK_Products_Price CHECK (Price >= 0),
    Stock INT           NOT NULL CONSTRAINT CK_Products_Stock CHECK (Stock >= 0)
);

CREATE TABLE Orders (
    Id         INT IDENTITY(1,1) CONSTRAINT PK_Orders PRIMARY KEY,
    CustomerId INT NOT NULL CONSTRAINT FK_Orders_Customers REFERENCES Customers(Id),
    OrderDate  DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_OrderDate DEFAULT SYSUTCDATETIME(),
    Status     NVARCHAR(20) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT 'Pending'
               CONSTRAINT CK_Orders_Status CHECK (Status IN ('Pending', 'Paid', 'Shipped', 'Cancelled'))
);

CREATE TABLE OrderLines (
    Id        INT IDENTITY(1,1) CONSTRAINT PK_OrderLines PRIMARY KEY,
    OrderId   INT NOT NULL CONSTRAINT FK_OrderLines_Orders REFERENCES Orders(Id),
    ProductId INT NOT NULL CONSTRAINT FK_OrderLines_Products REFERENCES Products(Id),
    Quantity  INT NOT NULL CONSTRAINT CK_OrderLines_Quantity CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL
);

SELECT name AS TableName FROM sys.tables ORDER BY name;`,
      output: `Changed database context to 'OrderFlow'.
TableName
----------
Customers
OrderLines
Orders
Products

(4 rows affected)`,
      steps: [
        "<code>USE OrderFlow;</code> : on se place dans la base OrderFlow. sqlcmd le confirme avec « Changed database context ».",
        "<code>DROP TABLE IF EXISTS OrderLines, Orders, Products, Customers;</code> : supprime les tables si elles existent, des enfants vers les parents. Le script peut donc être relancé.",
        "<code>Id INT IDENTITY(1,1) CONSTRAINT PK_Customers PRIMARY KEY</code> : un entier rempli automatiquement (départ 1, pas de 1), qui est la clé primaire.",
        "<code>Email … CONSTRAINT UQ_Customers_Email UNIQUE</code> : deux clients ne peuvent pas partager un email.",
        "<code>CHECK (Price &gt;= 0)</code> et <code>CHECK (Stock &gt;= 0)</code> : la base refuse un prix ou un stock négatif.",
        "<code>CustomerId INT NOT NULL … REFERENCES Customers(Id)</code> : la clé étrangère. Une commande sans client valide est impossible.",
        "<code>DEFAULT 'Pending'</code> et <code>CHECK (Status IN (…))</code> : un statut par défaut, et seulement quatre valeurs permises, comme ton futur enum <code>OrderStatus</code>.",
        "<code>UnitPrice DECIMAL(10,2)</code> : on recopie le prix au moment de la commande. Si le prix du produit change demain, la commande d'hier ne bouge pas."
      ],
      explain: "Enregistre ce script sous database/01-schema.sql : c'est la référence de tout le chapitre."
    },
    {
      title: "Le jeu de données de départ (02-seed.sql)",
      code: `-- 02-seed.sql : données de départ (lance 01-schema.sql juste avant pour repartir de zéro)
USE OrderFlow;
SET NOCOUNT ON; -- n'affiche pas les « (n rows affected) »

INSERT INTO Customers (Name, Email, CreatedAt) VALUES
 (N'Alice Martin',  N'alice@example.com', '2026-01-05 09:00'),
 (N'Bob Durand',    N'bob@example.com',   '2026-01-12 14:30'),
 (N'Chloé Bernard', N'chloe@example.com', '2026-02-01 11:15'),
 (N'David Petit',   N'david@example.com', '2026-02-20 16:45');

INSERT INTO Products (Name, Price, Stock) VALUES
 (N'Clavier mécanique', 89.90, 25),
 (N'Souris sans fil',   39.50, 80),
 (N'Écran 27 pouces',  279.00, 10),
 (N'Casque audio',     149.00,  0),
 (N'Câble USB-C',        9.99, 300),
 (N'Webcam HD',         59.90, 15);

INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES
 (1, '2026-03-01 10:00', 'Paid'),
 (1, '2026-03-15 18:20', 'Pending'),
 (2, '2026-03-20 08:45', 'Shipped'),
 (3, '2026-04-02 12:10', 'Paid'),
 (2, '2026-04-10 19:30', 'Cancelled');

INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES
 (1, 1, 1, 89.90), (1, 2, 1, 39.50),
 (2, 3, 1, 279.00),
 (3, 5, 2, 9.99),  (3, 2, 1, 39.50),
 (4, 4, 1, 149.00), (4, 5, 3, 9.99),
 (5, 1, 1, 89.90);

SELECT (SELECT COUNT(*) FROM Customers)  AS Customers,
       (SELECT COUNT(*) FROM Products)   AS Products,
       (SELECT COUNT(*) FROM Orders)     AS Orders,
       (SELECT COUNT(*) FROM OrderLines) AS OrderLines;`,
      output: `Changed database context to 'OrderFlow'.
Customers | Products | Orders | OrderLines
----------+----------+--------+-----------
4         | 6        | 5      | 8`,
      steps: [
        "<code>SET NOCOUNT ON;</code> : coupe les messages « (n rows affected) » pour garder une sortie lisible.",
        "<code>INSERT INTO Customers (Name, Email, CreatedAt) VALUES (…), (…)</code> : on liste les colonnes, puis une parenthèse par ligne. L'<code>Id</code> n'apparaît pas : IDENTITY le fournit (1, 2, 3, 4).",
        "<code>N'Chloé Bernard'</code> : le <code>N</code> garde l'accent intact.",
        "<code>'2026-01-05 09:00'</code> : une date s'écrit comme un texte au format <code>AAAA-MM-JJ hh:mm</code>, que SQL Server convertit en <code>DATETIME2</code>.",
        "<code>INSERT INTO Orders … (1, '2026-03-01 10:00', 'Paid')</code> : <code>1</code> est l'<code>Id</code> d'Alice. Les clients doivent donc être insérés avant les commandes.",
        "<code>SELECT (SELECT COUNT(*) FROM Customers) AS Customers, …</code> : des sous-requêtes qui comptent les lignes, pour vérifier le chargement d'un coup d'œil."
      ],
      explain: "Retiens ces données : David n'a aucune commande, la Webcam n'a jamais été vendue et le Casque est en rupture. Les leçons suivantes s'en servent."
    },
    {
      title: "Les contraintes en action",
      code: `-- 1) Un deuxième client avec l'email d'Alice : refusé par UNIQUE
INSERT INTO Customers (Name, Email) VALUES (N'Alice Bis', N'alice@example.com');

-- 2) Un prix négatif : refusé par CHECK
INSERT INTO Products (Name, Price, Stock) VALUES (N'Erreur', -5, 1);

-- 3) Une commande pour le client 99, qui n'existe pas : refusée par la FK
INSERT INTO Orders (CustomerId, Status) VALUES (99, 'Pending');

-- Rien n'a été ajouté
SELECT COUNT(*) AS Customers FROM Customers;`,
      output: `Msg 2627, Level 14, State 1, Server MONPC\\LOCALDB#1A2B3C4D, Line 2
Violation of UNIQUE KEY constraint 'UQ_Customers_Email'. Cannot insert duplicate key in object 'dbo.Customers'. The duplicate key value is (alice@example.com).
The statement has been terminated.
Msg 547, Level 16, State 1, Server MONPC\\LOCALDB#1A2B3C4D, Line 5
The INSERT statement conflicted with the CHECK constraint "CK_Products_Price". The conflict occurred in database "OrderFlow", table "dbo.Products", column 'Price'.
The statement has been terminated.
Msg 547, Level 16, State 1, Server MONPC\\LOCALDB#1A2B3C4D, Line 8
The INSERT statement conflicted with the FOREIGN KEY constraint "FK_Orders_Customers". The conflict occurred in database "OrderFlow", table "dbo.Customers", column 'Id'.
The statement has been terminated.
Customers
---------
4

(1 rows affected)`,
      steps: [
        "<code>INSERT INTO Customers (Name, Email) VALUES (…)</code> : on ne donne pas <code>CreatedAt</code>, le <code>DEFAULT</code> s'en chargerait. Mais l'email existe déjà : erreur 2627, qui cite <code>UQ_Customers_Email</code>.",
        "<code>Msg 2627, Level 14, State 1, Server …, Line 2</code> : numéro d'erreur, gravité, nom du serveur (le tien sera différent) et ligne fautive.",
        "<code>VALUES (N'Erreur', -5, 1)</code> : <code>CK_Products_Price</code> refuse le prix négatif (erreur 547).",
        "<code>VALUES (99, 'Pending')</code> : le client 99 n'existe pas, la clé étrangère <code>FK_Orders_Customers</code> bloque.",
        "<code>The statement has been terminated.</code> : seule l'instruction fautive est annulée, le script continue avec la suivante.",
        "<code>SELECT COUNT(*) AS Customers</code> : toujours 4 clients, aucune donnée invalide n'est entrée."
      ],
      explain: "En C#, ces erreurs arriveront sous forme de SqlException avec la propriété Number (2627, 547) : tu pourras les traduire en messages clairs pour l'utilisateur."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une table de catégories",
      prompt: `<p>Crée une table <code>Categories</code> avec un <code>Id</code> entier auto-incrémenté (clé primaire) et un <code>Name</code> texte de 50 caractères maximum, obligatoire et unique. Insère « Périphériques » et « Écrans », puis affiche le contenu de la table.</p>`,
      hint: `<p>Inspire-toi de <code>Customers</code> : <code>IDENTITY(1,1)</code>, <code>PRIMARY KEY</code>, <code>NOT NULL</code>, <code>UNIQUE</code>. N'oublie pas le <code>N</code> devant les textes accentués.</p>`,
      solution: `CREATE TABLE Categories (
    Id   INT IDENTITY(1,1) CONSTRAINT PK_Categories PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL CONSTRAINT UQ_Categories_Name UNIQUE
);

INSERT INTO Categories (Name) VALUES (N'Périphériques'), (N'Écrans');
SELECT Id, Name FROM Categories;

-- Pour garder le schéma du cours propre ensuite :
-- DROP TABLE Categories;`
    },
    {
      level: "moyen",
      title: "Les avis clients",
      prompt: `<p>Crée une table <code>ProductReviews</code> : <code>Id</code> (clé primaire auto), <code>ProductId</code> (clé étrangère vers <code>Products</code>), <code>Rating</code> (entier obligatoire entre 1 et 5), <code>Comment</code> (texte de 500 caractères, <strong>facultatif</strong>) et <code>CreatedAt</code> (date remplie automatiquement). Insère un avis avec commentaire, un sans commentaire, et vérifie qu'une note de 6 est refusée.</p>`,
      hint: `<p>Une plage se vérifie avec <code>CHECK (Rating BETWEEN 1 AND 5)</code>. Une colonne facultative se déclare <code>NULL</code>.</p>`,
      solution: `CREATE TABLE ProductReviews (
    Id        INT IDENTITY(1,1) CONSTRAINT PK_ProductReviews PRIMARY KEY,
    ProductId INT NOT NULL CONSTRAINT FK_ProductReviews_Products REFERENCES Products(Id),
    Rating    INT NOT NULL CONSTRAINT CK_ProductReviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    Comment   NVARCHAR(500) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductReviews_CreatedAt DEFAULT SYSUTCDATETIME()
);

INSERT INTO ProductReviews (ProductId, Rating, Comment) VALUES (1, 5, N'Super clavier');
INSERT INTO ProductReviews (ProductId, Rating) VALUES (2, 4);   -- Comment reste NULL
INSERT INTO ProductReviews (ProductId, Rating) VALUES (2, 6);   -- refusé : CK_ProductReviews_Rating

SELECT Id, ProductId, Rating, Comment FROM ProductReviews;

-- Supprime-la ensuite, sinon 01-schema.sql ne pourra plus supprimer Products :
-- DROP TABLE ProductReviews;`
    },
    {
      level: "difficile",
      title: "Faire évoluer une table existante",
      prompt: `<p>Sans recréer les tables, ajoute à <code>Products</code> une colonne obligatoire <code>IsActive</code> (vrai/faux) qui vaut vrai pour tous les produits existants, et à <code>Customers</code> une colonne facultative <code>Phone</code> (20 caractères). Affiche ensuite les deux tables pour vérifier. Explique pourquoi la première colonne a besoin d'un <code>DEFAULT</code>.</p>`,
      hint: `<p>On modifie une table avec <code>ALTER TABLE … ADD …</code>. Sépare l'ajout des colonnes et le <code>SELECT</code> par un <code>GO</code>. Relance ensuite <code>01-schema.sql</code> et <code>02-seed.sql</code> pour revenir au schéma du cours.</p>`,
      solution: `-- Colonne obligatoire : sans DEFAULT, les 6 lignes existantes n'auraient
-- aucune valeur pour IsActive, et NOT NULL l'interdit
ALTER TABLE Products
    ADD IsActive BIT NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1;

-- Colonne facultative : les lignes existantes reçoivent NULL
ALTER TABLE Customers
    ADD Phone NVARCHAR(20) NULL;
GO
SELECT Id, Name, IsActive FROM Products;   -- IsActive = 1 partout
SELECT Id, Name, Phone FROM Customers;     -- Phone = NULL partout`
    }
  ],
  quiz: [
    {
      q: `Quel type choisis-tu pour la colonne <code>Price</code> d'un produit ?`,
      options: ["<code>FLOAT</code>", "<code>DECIMAL(10,2)</code>", "<code>NVARCHAR(10)</code>"],
      answer: 1,
      why: `<code>DECIMAL</code> stocke les nombres décimaux exactement, comme <code>decimal</code> en C#. <code>FLOAT</code> fait des arrondis binaires (0,1 + 0,2 n'y vaut pas exactement 0,3), et un prix en texte ne se calcule pas.`
    },
    {
      q: `Que garantit <code>CustomerId INT NOT NULL REFERENCES Customers(Id)</code> ?`,
      options: ["Que chaque commande pointe vers un client qui existe", "Que chaque client a au moins une commande", "Que CustomerId est unique dans Orders"],
      answer: 0,
      why: `C'est une clé étrangère : la valeur doit exister dans <code>Customers.Id</code>. Elle n'oblige pas un client à avoir des commandes (David n'en a aucune), et un client peut avoir plusieurs commandes.`
    },
    {
      q: `Pourquoi n'écris-tu pas l'<code>Id</code> dans <code>INSERT INTO Customers (Name, Email) VALUES (…)</code> ?`,
      options: ["Parce qu'il vaut NULL", "Parce que la clé primaire est facultative", "Parce que <code>IDENTITY</code> le génère automatiquement"],
      answer: 2,
      why: `<code>IDENTITY(1,1)</code> fournit 1, 2, 3… tout seul. Une clé primaire n'est jamais NULL ni facultative : chaque ligne en a une.`
    },
    {
      q: `Le script <code>DROP TABLE IF EXISTS Customers, Orders;</code> échoue. Pourquoi ?`,
      options: ["Il faut un <code>GO</code> entre les deux", "<code>Orders</code> référence <code>Customers</code> : il faut supprimer l'enfant d'abord", "<code>IF EXISTS</code> n'existe pas en T-SQL"],
      answer: 1,
      why: `Une table référencée par une clé étrangère ne peut pas être supprimée. On supprime donc <code>Orders</code> avant <code>Customers</code>. <code>DROP TABLE IF EXISTS</code> existe bien depuis SQL Server 2016.`
    }
  ],
  project: `<p><strong>OrderFlow : le schéma et les classes.</strong> Enregistre les exemples 1 et 2 dans <code>database/01-schema.sql</code> et <code>database/02-seed.sql</code>, puis exécute-les. Dans ton projet console OrderFlow, crée les classes qui correspondent aux tables : <code>Customer</code> (<code>int Id</code>, <code>string Name</code>, <code>string Email</code>, <code>DateTime CreatedAt</code>), <code>Product</code> (<code>decimal Price</code>, <code>int Stock</code>…), <code>Order</code> et <code>OrderLine</code>, plus <code>enum OrderStatus { Pending, Paid, Shipped, Cancelled }</code>. Vérifie que chaque type C# correspond au type SQL du tableau de la leçon.</p>`,
  resources: [
    { label: "CREATE TABLE (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/statements/create-table-transact-sql" },
    { label: "Types de données (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/data-types/data-types-transact-sql" }
  ]
});

// =====================================================================
// 3. Lire des données : SELECT, WHERE, ORDER BY
// =====================================================================
window.COURSE.push({
  key: "sql-select",
  title: "Lire des données : SELECT, WHERE, ORDER BY",
  summary: "Tu sauras choisir les colonnes, filtrer les lignes, trier et paginer un résultat sur les tables OrderFlow.",
  objectives: [
    "Choisir et renommer les colonnes avec SELECT et AS",
    "Filtrer avec WHERE : comparaisons, AND/OR, IN, BETWEEN, LIKE, IS NULL",
    "Trier avec ORDER BY et limiter avec TOP",
    "Paginer avec OFFSET … FETCH NEXT"
  ],
  analogy: `<p>Imagine un <strong>catalogue de vente par correspondance</strong>. <code>SELECT</code>, c'est choisir quelles informations tu recopies (le nom et le prix, pas la description). <code>WHERE</code>, c'est ne garder que les pages qui t'intéressent (« moins de 100 € et en stock »). <code>ORDER BY</code>, c'est ranger ta liste du moins cher au plus cher.</p>
<p>Et la pagination, c'est la page 2 du catalogue : tu sautes les premiers articles et tu en lis quelques-uns.</p>`,
  lesson: `<h3>La forme d'une requête de lecture</h3>
<p>Une lecture suit toujours le même squelette : <code>SELECT</code> les colonnes, <code>FROM</code> la table, puis éventuellement <code>WHERE</code> (filtre) et <code>ORDER BY</code> (tri). Les mots-clés ne sont pas sensibles à la casse, mais on les écrit en majuscules par convention, pour bien les distinguer des noms de tables et de colonnes.</p>
<p>Si tu connais les méthodes de tableau en JavaScript, c'est très proche : <code>WHERE</code> ressemble à <code>filter</code>, <code>SELECT</code> à <code>map</code> et <code>ORDER BY</code> à <code>sort</code>. Et c'est exactement ce que LINQ fera en C#.</p>
<div class="flow"><span>FROM : la table</span><span>WHERE : filtrer</span><span>SELECT : colonnes</span><span>ORDER BY : trier</span><span>OFFSET : paginer</span></div>
<p>Ce schéma montre l'<strong>ordre logique</strong> dans lequel SQL Server traite la requête, différent de l'ordre d'écriture. Conséquence pratique : un alias créé dans <code>SELECT</code> (<code>AS StockValue</code>) est utilisable dans <code>ORDER BY</code>, mais pas dans <code>WHERE</code>, qui est évalué avant.</p>

<h3>Choisir ses colonnes</h3>
<p><code>SELECT *</code> renvoie toutes les colonnes. C'est pratique pour explorer, mais dans une application on liste toujours les colonnes voulues : moins de données transférées, et le code ne casse pas si quelqu'un ajoute une colonne. <code>AS</code> renomme une colonne ou un calcul : <code>Price * Stock AS StockValue</code>.</p>

<h3>Filtrer avec WHERE</h3>
<table>
<tr><th>Opérateur</th><th>Exemple</th><th>Sens</th></tr>
<tr><td><code>=</code>, <code>&lt;&gt;</code></td><td><code>Status = 'Paid'</code></td><td>Égal, différent (un seul <code>=</code>, pas <code>==</code>)</td></tr>
<tr><td><code>&lt;</code>, <code>&gt;=</code>…</td><td><code>Price &lt; 100</code></td><td>Comparaisons de nombres ou de dates</td></tr>
<tr><td><code>AND</code>, <code>OR</code>, <code>NOT</code></td><td><code>Stock &gt; 0 AND Price &lt; 100</code></td><td>Combiner des conditions</td></tr>
<tr><td><code>IN</code></td><td><code>Status IN ('Paid', 'Shipped')</code></td><td>Une valeur parmi une liste</td></tr>
<tr><td><code>BETWEEN</code></td><td><code>Price BETWEEN 50 AND 150</code></td><td>Entre deux bornes, <strong>incluses</strong></td></tr>
<tr><td><code>LIKE</code></td><td><code>Name LIKE N'C%'</code></td><td>Motif : <code>%</code> = n'importe quelle suite, <code>_</code> = un caractère</td></tr>
<tr><td><code>IS NULL</code></td><td><code>Comment IS NULL</code></td><td>Valeur absente</td></tr>
</table>
<p>Les textes et les dates s'écrivent entre <strong>apostrophes simples</strong>. Les guillemets doubles servent à autre chose (les noms d'objets), ne les utilise pas pour du texte.</p>
<div class="tip">Ne compare jamais avec <code>= NULL</code> : la comparaison donne « inconnu » et ne renvoie aucune ligne. Écris <code>IS NULL</code> ou <code>IS NOT NULL</code>. Et quand tu mélanges <code>AND</code> et <code>OR</code>, mets des parenthèses : <code>AND</code> passe avant <code>OR</code>.</div>

<h3>Filtrer sur des dates</h3>
<p>Pour « toutes les commandes de mars », la forme sûre est un intervalle semi-ouvert : <code>OrderDate &gt;= '2026-03-01' AND OrderDate &lt; '2026-04-01'</code>. Elle prend toutes les heures du 31 mars, alors que <code>BETWEEN '2026-03-01' AND '2026-03-31'</code> s'arrêterait au 31 à minuit pile et oublierait la journée.</p>

<h3>Trier, limiter, paginer</h3>
<p><code>ORDER BY Price DESC</code> trie du plus grand au plus petit (<code>ASC</code>, croissant, est le défaut). Sans <code>ORDER BY</code>, l'ordre des lignes n'est <strong>pas garanti</strong>, même s'il a l'air stable. <code>TOP (2)</code> garde les deux premières lignes.</p>
<p>Pour une API qui renvoie une page de résultats, on utilise <code>OFFSET n ROWS FETCH NEXT m ROWS ONLY</code> : on saute <code>n</code> lignes et on en lit <code>m</code>. La formule : <code>OFFSET (page - 1) * taille</code>.</p>
<pre class="diagram">
 Trié :  [1] [2] | [3] [4] | [5] [6]
          page 1    page 2    page 3
 Page 2, taille 2 : OFFSET 2 ROWS
                    FETCH NEXT 2 ROWS ONLY
</pre>
<div class="note">Une pagination doit trier sur une colonne unique, sinon deux lignes à égalité peuvent changer de page d'une requête à l'autre. Ajoute toujours <code>Id</code> en dernier critère : <code>ORDER BY Price DESC, Id</code>.</div>`,
  examples: [
    {
      title: "Les produits du plus cher au moins cher",
      code: `-- Les produits du plus cher au moins cher
SELECT Id, Name, Price
FROM Products
ORDER BY Price DESC;`,
      output: `Id | Name              | Price
---+-------------------+-------
3  | Écran 27 pouces   | 279.00
4  | Casque audio      | 149.00
1  | Clavier mécanique | 89.90
6  | Webcam HD         | 59.90
2  | Souris sans fil   | 39.50
5  | Câble USB-C       | 9.99

(6 rows affected)`,
      steps: [
        "<code>SELECT Id, Name, Price</code> : on ne garde que trois colonnes ; <code>Stock</code> n'apparaît pas.",
        "<code>FROM Products</code> : la table lue. Toutes les requêtes de ce chapitre s'exécutent dans la base OrderFlow (<code>USE OrderFlow;</code> ou <code>-d OrderFlow</code>).",
        "<code>ORDER BY Price DESC</code> : tri décroissant sur le prix. Sans <code>DESC</code>, on aurait le moins cher en premier.",
        "<code>279.00</code> : un <code>DECIMAL(10,2)</code> s'affiche toujours avec deux décimales et un point."
      ]
    },
    {
      title: "Filtrer avec WHERE",
      code: `-- Produits en stock, à moins de 100 €
SELECT Name, Price, Stock
FROM Products
WHERE Stock > 0 AND Price < 100
ORDER BY Name;

-- Commandes payées ou expédiées en mars 2026
SELECT Id, CustomerId, OrderDate, Status
FROM Orders
WHERE Status IN ('Paid', 'Shipped')
  AND OrderDate >= '2026-03-01' AND OrderDate < '2026-04-01';

-- Clients dont le nom commence par B ou C
SELECT Name, Email
FROM Customers
WHERE Name LIKE N'B%' OR Name LIKE N'C%';`,
      output: `Name              | Price | Stock
------------------+-------+------
Câble USB-C       | 9.99  | 300
Clavier mécanique | 89.90 | 25
Souris sans fil   | 39.50 | 80
Webcam HD         | 59.90 | 15

(4 rows affected)
Id | CustomerId | OrderDate           | Status
---+------------+---------------------+--------
1  | 1          | 2026-03-01 10:00:00 | Paid
3  | 2          | 2026-03-20 08:45:00 | Shipped

(2 rows affected)
Name          | Email
--------------+------------------
Bob Durand    | bob@example.com
Chloé Bernard | chloe@example.com

(2 rows affected)`,
      steps: [
        "<code>WHERE Stock &gt; 0 AND Price &lt; 100</code> : les deux conditions doivent être vraies. Le Casque (stock 0) et l'Écran (279 €) sont écartés.",
        "<code>ORDER BY Name</code> : tri alphabétique. « Câble » passe avant « Clavier » : pour le tri, « â » compte comme un « a », qui vient avant « l ».",
        "<code>Status IN ('Paid', 'Shipped')</code> : plus lisible que <code>Status = 'Paid' OR Status = 'Shipped'</code>.",
        "<code>OrderDate &gt;= '2026-03-01' AND OrderDate &lt; '2026-04-01'</code> : tout le mois de mars. La commande 2 (Pending) est exclue par le statut.",
        "<code>Name LIKE N'B%'</code> : « commence par B ». <code>%</code> remplace n'importe quelle suite de caractères, même vide.",
        "<code>(2 rows affected)</code> : chaque requête du script produit son propre tableau."
      ]
    },
    {
      title: "Calculer, paginer et prendre les premiers",
      code: `-- Valeur du stock de chaque produit, page 2 (2 produits par page)
SELECT Id,
       Name,
       Price * Stock AS StockValue
FROM Products
ORDER BY StockValue DESC, Id
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;

-- Les 2 commandes les plus récentes
SELECT TOP (2) Id, OrderDate, Status
FROM Orders
ORDER BY OrderDate DESC;`,
      output: `Id | Name              | StockValue
---+-------------------+-----------
3  | Écran 27 pouces   | 2790.00
1  | Clavier mécanique | 2247.50

(2 rows affected)
Id | OrderDate           | Status
---+---------------------+----------
5  | 2026-04-10 19:30:00 | Cancelled
4  | 2026-04-02 12:10:00 | Paid

(2 rows affected)`,
      steps: [
        "<code>Price * Stock AS StockValue</code> : une colonne calculée pour chaque ligne, avec un nom.",
        "<code>ORDER BY StockValue DESC, Id</code> : l'alias est accepté dans <code>ORDER BY</code>. <code>Id</code> départage les égalités.",
        "<code>OFFSET 2 ROWS</code> : on saute les deux plus grosses valeurs (Souris 3160.00, Câble 2997.00), qui forment la page 1.",
        "<code>FETCH NEXT 2 ROWS ONLY</code> : on lit les deux suivantes, c'est la page 2.",
        "<code>SELECT TOP (2)</code> : ne garde que les deux premières lignes du tri. Sans <code>ORDER BY</code>, « les deux premières » ne voudrait rien dire."
      ],
      explain: "OFFSET … FETCH exige un ORDER BY : sans tri, SQL Server refuse la requête."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les clients de février",
      prompt: `<p>Affiche le nom, l'email et la date de création des clients créés en <strong>février 2026</strong>, triés par nom.</p>`,
      hint: `<p>Utilise l'intervalle semi-ouvert : à partir du 1<sup>er</sup> février inclus, avant le 1<sup>er</sup> mars.</p>`,
      solution: `SELECT Name, Email, CreatedAt
FROM Customers
WHERE CreatedAt >= '2026-02-01' AND CreatedAt < '2026-03-01'
ORDER BY Name;
-- Chloé Bernard, David Petit`
    },
    {
      level: "moyen",
      title: "Recherche dans le catalogue",
      prompt: `<p>Affiche le nom et le prix des produits dont le nom contient « USB » <strong>ou</strong> dont le prix est compris entre 50 et 150 €, triés du moins cher au plus cher.</p>`,
      hint: `<p>« Contient » s'écrit <code>LIKE N'%USB%'</code>. Pour l'intervalle, <code>BETWEEN</code> inclut les deux bornes.</p>`,
      solution: `SELECT Name, Price
FROM Products
WHERE Name LIKE N'%USB%'
   OR Price BETWEEN 50 AND 150
ORDER BY Price;
-- Câble USB-C 9.99, Webcam HD 59.90, Clavier mécanique 89.90, Casque audio 149.00`
    },
    {
      level: "difficile",
      title: "Une page de commandes",
      prompt: `<p>On affiche les commandes non annulées, de la plus récente à la plus ancienne, <strong>2 par page</strong>. Écris la requête de la <strong>page 2</strong>, avec en plus une colonne <code>DaysBeforeMay</code> : le nombre de jours entre la date de commande et le 1<sup>er</sup> mai 2026.</p>`,
      hint: `<p><code>DATEDIFF(DAY, debut, fin)</code> compte les jours entre deux dates. Page 2 avec 2 par page : <code>OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY</code>. Pense à ajouter <code>Id</code> au tri.</p>`,
      solution: `SELECT Id,
       OrderDate,
       Status,
       DATEDIFF(DAY, OrderDate, '2026-05-01') AS DaysBeforeMay
FROM Orders
WHERE Status <> 'Cancelled'
ORDER BY OrderDate DESC, Id
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
-- Commande 2 (47 jours), commande 1 (61 jours)`
    }
  ],
  quiz: [
    {
      q: `Quelle condition trouve les commandes dont le statut est absent ?`,
      options: ["<code>WHERE Status = NULL</code>", "<code>WHERE Status IS NULL</code>", "<code>WHERE Status = ''</code>"],
      answer: 1,
      why: `Toute comparaison avec <code>NULL</code> donne « inconnu », donc <code>= NULL</code> ne renvoie jamais rien. <code>''</code> est une chaîne vide, ce n'est pas la même chose qu'une valeur absente.`
    },
    {
      q: `Que renvoie <code>WHERE Price BETWEEN 50 AND 150</code> pour un produit à 150,00 € ?`,
      options: ["Il est exclu", "Ça dépend du tri", "Il est inclus"],
      answer: 2,
      why: `<code>BETWEEN</code> inclut ses deux bornes : c'est <code>Price &gt;= 50 AND Price &lt;= 150</code>.`
    },
    {
      q: `Pourquoi <code>SELECT Price * Stock AS StockValue FROM Products WHERE StockValue &gt; 1000</code> échoue-t-il ?`,
      options: ["<code>WHERE</code> est évalué avant <code>SELECT</code>, l'alias n'existe pas encore", "On ne peut pas multiplier deux colonnes", "Il manque un <code>ORDER BY</code>"],
      answer: 0,
      why: `L'ordre logique est FROM, WHERE, SELECT, ORDER BY. Dans <code>WHERE</code>, il faut répéter le calcul : <code>WHERE Price * Stock &gt; 1000</code>. L'alias reste utilisable dans <code>ORDER BY</code>.`
    },
    {
      q: `Pour la page 3 avec 10 éléments par page, que vaut l'OFFSET ?`,
      options: ["30", "20", "3"],
      answer: 1,
      why: `<code>OFFSET (page - 1) * taille</code> = (3 - 1) × 10 = 20 : on saute les pages 1 et 2.`
    }
  ],
  project: `<p><strong>OrderFlow : les requêtes du catalogue.</strong> Crée <code>database/10-queries.sql</code> et écris-y les requêtes dont l'application aura besoin : la liste des produits paginée et triée par nom (page et taille en dur pour l'instant), les produits en rupture de stock (<code>Stock = 0</code>), et la recherche d'un client par email. Au chapitre ADO.NET, chacune deviendra une méthode C# avec des paramètres.</p>`,
  resources: [
    { label: "SELECT (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/select-transact-sql" },
    { label: "Clause ORDER BY, OFFSET et FETCH", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/select-order-by-clause-transact-sql" }
  ]
});

// =====================================================================
// 4. Croiser des tables avec JOIN
// =====================================================================
window.COURSE.push({
  key: "sql-joins",
  title: "Croiser des tables avec JOIN",
  summary: "Tu sauras assembler plusieurs tables dans une seule requête avec INNER JOIN et LEFT JOIN, et choisir la bonne jointure.",
  objectives: [
    "Relier deux tables avec INNER JOIN … ON",
    "Utiliser des alias de table pour rester lisible",
    "Garder les lignes sans correspondance avec LEFT JOIN",
    "Enchaîner plusieurs jointures pour afficher le détail d'une commande"
  ],
  analogy: `<p>Tu as deux listes papier : la liste des <strong>commandes</strong> (« commande 3, client n° 2 ») et le <strong>carnet d'adresses</strong> (« client n° 2 : Bob Durand »). Pour savoir qui a passé la commande 3, tu prends le numéro de client et tu le cherches dans le carnet.</p>
<p>Une jointure fait exactement ça, pour toutes les lignes d'un coup : elle met côte à côte les lignes des deux tables dont les numéros correspondent.</p>`,
  lesson: `<h3>Pourquoi joindre ?</h3>
<p>À la leçon précédente, tu as séparé les données en plusieurs tables : le nom du client vit dans <code>Customers</code>, pas recopié dans chaque commande. C'est sain (une seule source de vérité), mais pour afficher « commande 3 : Bob Durand », il faut <strong>recoller</strong> les morceaux. C'est le rôle de <code>JOIN</code>.</p>
<p>La condition de jointure, écrite après <code>ON</code>, dit quelles lignes vont ensemble. Presque toujours, c'est « la clé étrangère égale la clé primaire » : <code>o.CustomerId = c.Id</code>.</p>

<h3>Les alias de table</h3>
<p>Quand deux tables ont une colonne <code>Id</code>, SQL Server doit savoir de laquelle tu parles. On donne donc un petit surnom à chaque table : <code>FROM Orders AS o</code>, puis on préfixe chaque colonne : <code>o.Id</code>, <code>c.Name</code>. Sans préfixe, une colonne présente dans les deux tables provoque l'erreur « Ambiguous column name ».</p>

<h3>INNER JOIN : seulement les correspondances</h3>
<p><code>INNER JOIN</code> (ou simplement <code>JOIN</code>) garde uniquement les paires qui correspondent. Un client sans commande n'apparaît pas, une commande sans client non plus (de toute façon, la clé étrangère l'interdit).</p>
<pre class="diagram">
 Customers            Orders
 1 Alice   &lt;------&gt;   1 (client 1)
           &lt;------&gt;   2 (client 1)
 2 Bob     &lt;------&gt;   3 (client 2)
           &lt;------&gt;   5 (client 2)
 3 Chloé   &lt;------&gt;   4 (client 3)
 4 David      (rien)

 INNER JOIN : 5 lignes, David absent
 LEFT JOIN  : 6 lignes, David + NULL
</pre>

<h3>LEFT JOIN : garder toute la table de gauche</h3>
<p><code>LEFT JOIN</code> garde <strong>toutes</strong> les lignes de la table écrite à gauche (avant le <code>JOIN</code>), même sans correspondance. Les colonnes de la table de droite sont alors remplies avec <code>NULL</code>. C'est l'outil pour « tous les clients, avec leurs commandes s'ils en ont ».</p>
<div class="compare"><div><h4>INNER JOIN</h4><p>Intersection : seulement les lignes présentes des deux côtés. Idéal pour « les commandes avec leur client ».</p></div><div><h4>LEFT JOIN</h4><p>Toute la gauche, et la droite quand elle existe (sinon NULL). Idéal pour « tous les clients, même sans commande ».</p></div></div>
<p>Astuce classique : <code>LEFT JOIN</code> puis <code>WHERE o.Id IS NULL</code> trouve les lignes <em>sans</em> correspondance, par exemple les clients qui n'ont jamais commandé.</p>
<div class="tip">Un filtre sur la table de droite d'un <code>LEFT JOIN</code> placé dans le <code>WHERE</code> supprime les lignes NULL et transforme ton LEFT JOIN en INNER JOIN sans prévenir. Pour garder les lignes sans correspondance, mets ce filtre dans le <code>ON</code> : <code>LEFT JOIN Orders AS o ON o.CustomerId = c.Id AND o.Status &lt;&gt; 'Cancelled'</code>.</div>

<h3>Enchaîner les jointures</h3>
<p>On peut joindre autant de tables que nécessaire : chaque <code>JOIN</code> ajoute une table au résultat. Pour le détail d'une commande, on part de <code>Orders</code>, on rejoint <code>Customers</code> pour le nom, <code>OrderLines</code> pour les lignes, puis <code>Products</code> pour le nom de chaque produit.</p>
<div class="flow"><span>Orders</span><span>+ Customers</span><span>+ OrderLines</span><span>+ Products</span></div>
<p>Attention : une jointure vers une table « plusieurs » multiplie les lignes. Une commande à 2 lignes donne 2 lignes de résultat, avec le nom du client répété. C'est normal, et c'est ce qui te permettra de calculer des totaux à la leçon suivante.</p>
<p>En C#, tu retrouveras la même idée avec LINQ (<code>join</code>) et surtout avec EF Core, où <code>Include(o =&gt; o.Customer)</code> génère ces <code>JOIN</code> pour toi.</p>
<div class="note">Il existe aussi <code>RIGHT JOIN</code> (le miroir du LEFT) et <code>FULL JOIN</code> (tout des deux côtés). En pratique, on écrit presque toujours <code>LEFT JOIN</code> en mettant la table « principale » à gauche : les requêtes restent lisibles de haut en bas.</div>`,
  examples: [
    {
      title: "Chaque commande avec son client (INNER JOIN)",
      code: `-- Chaque commande avec le nom de son client
SELECT o.Id AS OrderId,
       c.Name AS Customer,
       o.Status
FROM Orders AS o
INNER JOIN Customers AS c ON c.Id = o.CustomerId
ORDER BY o.Id;`,
      output: `OrderId | Customer      | Status
--------+---------------+----------
1       | Alice Martin  | Paid
2       | Alice Martin  | Pending
3       | Bob Durand    | Shipped
4       | Chloé Bernard | Paid
5       | Bob Durand    | Cancelled

(5 rows affected)`,
      steps: [
        "<code>FROM Orders AS o</code> : on part des commandes, surnommées <code>o</code>.",
        "<code>INNER JOIN Customers AS c</code> : on y ajoute les clients, surnommés <code>c</code>.",
        "<code>ON c.Id = o.CustomerId</code> : une ligne de commande va avec le client dont l'<code>Id</code> vaut son <code>CustomerId</code>.",
        "<code>o.Id AS OrderId, c.Name AS Customer</code> : on pioche des colonnes dans les deux tables, et on les renomme pour éviter deux colonnes « Id » et « Name ».",
        "<code>(5 rows affected)</code> : une ligne par commande. David, sans commande, n'apparaît pas."
      ]
    },
    {
      title: "Tous les clients, même sans commande (LEFT JOIN)",
      code: `-- Tous les clients, avec leurs commandes s'ils en ont
SELECT c.Name, o.Id AS OrderId, o.Status
FROM Customers AS c
LEFT JOIN Orders AS o ON o.CustomerId = c.Id
ORDER BY c.Id, o.Id;

-- Seulement les clients qui n'ont jamais commandé
SELECT c.Name
FROM Customers AS c
LEFT JOIN Orders AS o ON o.CustomerId = c.Id
WHERE o.Id IS NULL;`,
      output: `Name          | OrderId | Status
--------------+---------+----------
Alice Martin  | 1       | Paid
Alice Martin  | 2       | Pending
Bob Durand    | 3       | Shipped
Bob Durand    | 5       | Cancelled
Chloé Bernard | 4       | Paid
David Petit   | NULL    | NULL

(6 rows affected)
Name
-----------
David Petit

(1 rows affected)`,
      steps: [
        "<code>FROM Customers AS c LEFT JOIN Orders AS o</code> : cette fois les clients sont à gauche : on les garde tous.",
        "<code>ON o.CustomerId = c.Id</code> : même condition qu'avant, seul le type de jointure change.",
        "<code>David Petit | NULL | NULL</code> : pas de commande correspondante, les colonnes de <code>Orders</code> valent <code>NULL</code>.",
        "<code>ORDER BY c.Id, o.Id</code> : tri par client puis par commande.",
        "<code>WHERE o.Id IS NULL</code> : on ne garde que les lignes où aucune commande n'a été trouvée."
      ],
      explain: "Avec INNER JOIN, la première requête aurait renvoyé 5 lignes et la seconde aucune."
    },
    {
      title: "Le détail d'une commande sur quatre tables",
      code: `-- Le détail complet de la commande n° 4 : 4 tables reliées
SELECT o.Id        AS OrderId,
       c.Name      AS Customer,
       p.Name      AS Product,
       l.Quantity,
       l.UnitPrice,
       l.Quantity * l.UnitPrice AS LineTotal
FROM Orders AS o
INNER JOIN Customers  AS c ON c.Id = o.CustomerId
INNER JOIN OrderLines AS l ON l.OrderId = o.Id
INNER JOIN Products   AS p ON p.Id = l.ProductId
WHERE o.Id = 4
ORDER BY l.Id;`,
      output: `OrderId | Customer      | Product      | Quantity | UnitPrice | LineTotal
--------+---------------+--------------+----------+-----------+----------
4       | Chloé Bernard | Casque audio | 1        | 149.00    | 149.00
4       | Chloé Bernard | Câble USB-C  | 3        | 9.99      | 29.97

(2 rows affected)`,
      steps: [
        "<code>INNER JOIN Customers AS c ON c.Id = o.CustomerId</code> : on récupère le nom du client.",
        "<code>INNER JOIN OrderLines AS l ON l.OrderId = o.Id</code> : on ajoute les lignes de la commande. La commande 4 en a deux, d'où deux lignes de résultat.",
        "<code>INNER JOIN Products AS p ON p.Id = l.ProductId</code> : pour chaque ligne, le nom du produit.",
        "<code>l.Quantity * l.UnitPrice AS LineTotal</code> : le total de chaque ligne, calculé avec le prix enregistré au moment de la commande.",
        "<code>WHERE o.Id = 4</code> : le filtre s'applique au résultat assemblé.",
        "<code>Chloé Bernard</code> apparaît deux fois : la jointure vers une table « plusieurs » répète les colonnes du « un »."
      ],
      explain: "Cette requête sera la base de l'endpoint GET /api/orders/4 dans la partie API."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les produits d'une commande",
      prompt: `<p>Affiche, pour la commande n° 1, le nom de chaque produit, la quantité et le prix unitaire.</p>`,
      hint: `<p>Pars de <code>OrderLines</code> et rejoins <code>Products</code> sur <code>p.Id = l.ProductId</code>.</p>`,
      solution: `SELECT p.Name AS Product, l.Quantity, l.UnitPrice
FROM OrderLines AS l
INNER JOIN Products AS p ON p.Id = l.ProductId
WHERE l.OrderId = 1;
-- Clavier mécanique 1 89.90, Souris sans fil 1 39.50`
    },
    {
      level: "moyen",
      title: "Les produits jamais vendus",
      prompt: `<p>Trouve l'<code>Id</code> et le nom des produits qui n'apparaissent dans <strong>aucune</strong> ligne de commande.</p>`,
      hint: `<p>C'est le même schéma que « les clients sans commande » : <code>LEFT JOIN</code> puis <code>WHERE … IS NULL</code> sur une colonne de la table de droite.</p>`,
      solution: `SELECT p.Id, p.Name
FROM Products AS p
LEFT JOIN OrderLines AS l ON l.ProductId = p.Id
WHERE l.Id IS NULL;
-- 6 Webcam HD`
    },
    {
      level: "difficile",
      title: "Ce que chaque client a acheté",
      prompt: `<p>Liste <strong>tous</strong> les clients avec, pour chacun, le numéro de commande, le nom du produit et la quantité de chaque ligne, en <strong>ignorant les commandes annulées</strong>. Un client sans commande (non annulée) doit quand même apparaître, avec des NULL. Trie par nom de client, numéro de commande, puis ligne.</p>`,
      hint: `<p>Enchaîne trois <code>LEFT JOIN</code> (Orders, OrderLines, Products). Le filtre sur le statut va dans le <code>ON</code> de la jointure vers <code>Orders</code>, pas dans le <code>WHERE</code>.</p>`,
      solution: `SELECT c.Name AS Customer, o.Id AS OrderId, p.Name AS Product, l.Quantity
FROM Customers AS c
LEFT JOIN Orders AS o
       ON o.CustomerId = c.Id
      AND o.Status <> 'Cancelled'      -- dans le ON : on garde les clients sans commande
LEFT JOIN OrderLines AS l ON l.OrderId = o.Id
LEFT JOIN Products   AS p ON p.Id = l.ProductId
ORDER BY c.Name, o.Id, l.Id;
-- 8 lignes : la commande 5 (annulée) a disparu, David Petit apparaît avec NULL`
    }
  ],
  quiz: [
    {
      q: `Que renvoie <code>Customers INNER JOIN Orders</code> pour un client qui n'a aucune commande ?`,
      options: ["Une ligne avec des NULL", "Rien : le client n'apparaît pas", "Une erreur"],
      answer: 1,
      why: `<code>INNER JOIN</code> ne garde que les correspondances. C'est <code>LEFT JOIN</code> qui garderait le client avec des NULL à droite.`
    },
    {
      q: `Que veut dire l'erreur « Ambiguous column name 'Id' » ?`,
      options: ["La colonne Id n'existe pas", "Deux tables jointes ont une colonne Id et tu ne l'as pas préfixée", "Id est un mot réservé"],
      answer: 1,
      why: `SQL Server ne sait pas s'il s'agit de <code>o.Id</code> ou de <code>c.Id</code>. Préfixe toujours les colonnes avec l'alias de leur table.`
    },
    {
      q: `<code>FROM Customers c LEFT JOIN Orders o ON o.CustomerId = c.Id WHERE o.Status = 'Paid'</code> : que devient David, qui n'a pas de commande ?`,
      options: ["Il apparaît avec des NULL", "Il apparaît avec le statut Paid", "Il disparaît, car <code>NULL = 'Paid'</code> n'est pas vrai"],
      answer: 2,
      why: `Le <code>WHERE</code> s'applique après la jointure : la ligne de David a <code>o.Status</code> à NULL, la condition n'est pas vraie, la ligne est écartée. Pour le garder, mets le filtre dans le <code>ON</code>.`
    },
    {
      q: `Une commande a 3 lignes. Combien de lignes renvoie <code>Orders INNER JOIN OrderLines</code> pour cette commande ?`,
      options: ["3", "1", "4"],
      answer: 0,
      why: `Chaque ligne de commande trouve sa commande : 3 correspondances, donc 3 lignes, avec les colonnes de la commande répétées.`
    }
  ],
  project: `<p><strong>OrderFlow : le détail d'une commande.</strong> Ajoute à <code>database/10-queries.sql</code> deux requêtes : le détail complet d'une commande (client, produits, quantités, total de chaque ligne) et la liste de tous les clients avec leurs commandes, y compris ceux qui n'en ont pas (<code>LEFT JOIN</code>). Dans ton projet console, crée un <code>record OrderLineView(int OrderId, string Customer, string Product, int Quantity, decimal UnitPrice)</code> : c'est la forme que prendra chaque ligne de résultat quand tu la liras en C#.</p>`,
  resources: [
    { label: "Jointures (SQL Server)", url: "https://learn.microsoft.com/fr-fr/sql/relational-databases/performance/joins" },
    { label: "Clause FROM et JOIN (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/from-transact-sql" }
  ]
});

// =====================================================================
// 5. Regrouper et compter : GROUP BY et agrégats
// =====================================================================
window.COURSE.push({
  key: "sql-group",
  title: "Regrouper et compter : GROUP BY et agrégats",
  summary: "Tu sauras calculer des totaux, des moyennes et des comptes, globalement ou par groupe, et filtrer ces groupes avec HAVING.",
  objectives: [
    "Utiliser COUNT, SUM, AVG, MIN et MAX",
    "Regrouper des lignes avec GROUP BY",
    "Filtrer des groupes avec HAVING (et savoir quand utiliser WHERE)",
    "Combiner jointures et agrégats pour un chiffre d'affaires par client"
  ],
  analogy: `<p>Après une soirée, tu vides ta tirelire sur la table et tu fais des <strong>tas par type de pièce</strong> : les 1 €, les 2 €, les 50 centimes. Puis, pour chaque tas, tu comptes les pièces et tu calcules le montant.</p>
<p><code>GROUP BY</code>, c'est faire les tas. <code>COUNT</code> et <code>SUM</code>, c'est compter et additionner chaque tas. <code>HAVING</code>, c'est dire « je ne garde que les tas de plus de 10 € ».</p>`,
  lesson: `<h3>Les fonctions d'agrégat</h3>
<p>Une <strong>fonction d'agrégat</strong> prend plusieurs lignes et renvoie une seule valeur. Sans <code>GROUP BY</code>, elle résume toute la table en une ligne.</p>
<table>
<tr><th>Fonction</th><th>Rôle</th><th>Équivalent LINQ</th></tr>
<tr><td><code>COUNT(*)</code></td><td>Nombre de lignes</td><td><code>Count()</code></td></tr>
<tr><td><code>COUNT(col)</code></td><td>Nombre de valeurs non NULL dans la colonne</td><td><code>Count(x =&gt; x != null)</code></td></tr>
<tr><td><code>SUM(col)</code></td><td>Somme</td><td><code>Sum()</code></td></tr>
<tr><td><code>AVG(col)</code></td><td>Moyenne</td><td><code>Average()</code></td></tr>
<tr><td><code>MIN(col)</code>, <code>MAX(col)</code></td><td>Plus petite, plus grande valeur</td><td><code>Min()</code>, <code>Max()</code></td></tr>
</table>
<p>Les agrégats <strong>ignorent les NULL</strong> (sauf <code>COUNT(*)</code>, qui compte les lignes). Si aucune ligne ne correspond, <code>SUM</code> renvoie <code>NULL</code>, pas 0 : on écrit <code>ISNULL(SUM(x), 0)</code> pour obtenir 0.</p>

<h3>GROUP BY : un résultat par groupe</h3>
<p><code>GROUP BY Status</code> range les commandes en tas (un par statut), puis calcule les agrégats <em>dans chaque tas</em>. Le résultat contient une ligne par groupe.</p>
<pre class="diagram">
 Orders                  GROUP BY Status
 1 Paid       --+
 4 Paid       --+--&gt;  Paid       COUNT = 2
 2 Pending    -----&gt;  Pending    COUNT = 1
 3 Shipped    -----&gt;  Shipped    COUNT = 1
 5 Cancelled  -----&gt;  Cancelled  COUNT = 1
</pre>
<p>Règle d'or : dans le <code>SELECT</code>, chaque colonne doit être <strong>soit dans le GROUP BY, soit dans un agrégat</strong>. Écrire <code>SELECT Status, OrderDate, COUNT(*) … GROUP BY Status</code> échoue : quelle date afficher pour un groupe de deux commandes ? SQL Server refuse de choisir.</p>
<p>C'est le même principe que <code>GroupBy</code> en LINQ : <code>orders.GroupBy(o =&gt; o.Status).Select(g =&gt; new { g.Key, Count = g.Count() })</code>.</p>

<h3>WHERE ou HAVING ?</h3>
<p>Les deux filtrent, mais pas au même moment. <code>WHERE</code> filtre les <strong>lignes</strong> avant le regroupement. <code>HAVING</code> filtre les <strong>groupes</strong> après, et peut donc utiliser un agrégat.</p>
<div class="flow"><span>FROM + JOIN</span><span>WHERE : lignes</span><span>GROUP BY</span><span>HAVING : groupes</span><span>SELECT</span><span>ORDER BY</span></div>
<div class="compare"><div><h4>WHERE</h4><p>« Ignore les commandes annulées » : <code>WHERE o.Status &lt;&gt; 'Cancelled'</code>. Agit ligne par ligne, avant les calculs.</p></div><div><h4>HAVING</h4><p>« Garde les clients qui ont dépensé plus de 100 € » : <code>HAVING SUM(…) &gt; 100</code>. Agit sur les totaux déjà calculés.</p></div></div>
<div class="tip">Si un filtre ne contient pas d'agrégat, mets-le dans <code>WHERE</code> : SQL Server élimine les lignes plus tôt, la requête travaille sur moins de données. <code>HAVING</code> est réservé aux conditions sur <code>COUNT</code>, <code>SUM</code>, etc.</div>

<h3>Agréger après une jointure</h3>
<p>Pour un chiffre d'affaires par client, il faut les clients, leurs commandes et les lignes : on joint d'abord, on regroupe ensuite. Attention au piège : la jointure avec <code>OrderLines</code> répète chaque commande autant de fois qu'elle a de lignes. <code>COUNT(o.Id)</code> compterait donc des lignes, pas des commandes. <code>COUNT(DISTINCT o.Id)</code> compte chaque commande une seule fois.</p>
<p>Dans le <code>GROUP BY</code>, on met <code>c.Id, c.Name</code> et pas seulement <code>c.Name</code> : deux clients peuvent porter le même nom, l'<code>Id</code> garantit qu'on ne les fusionne pas.</p>
<div class="note">Une moyenne sur des <code>DECIMAL</code> renvoie beaucoup de décimales (<code>104.548333</code>). Arrondis à l'affichage dans ton application plutôt qu'en SQL, ou avec <code>ROUND(AVG(Price), 2)</code> si le résultat est destiné tel quel à un rapport. Et pour une moyenne sur des <code>INT</code>, SQL Server fait une division entière : <code>AVG(Stock)</code> donne 71, pas 71,67. Écris <code>AVG(CAST(Stock AS DECIMAL(10,2)))</code> pour garder les décimales.</div>`,
  examples: [
    {
      title: "Des chiffres sur tout le catalogue",
      code: `-- Des chiffres sur tout le catalogue : une seule ligne en sortie
SELECT COUNT(*)   AS ProductCount,
       MIN(Price) AS Cheapest,
       MAX(Price) AS MostExpensive,
       AVG(Price) AS AveragePrice,
       SUM(Stock) AS TotalStock
FROM Products;`,
      output: `ProductCount | Cheapest | MostExpensive | AveragePrice | TotalStock
-------------+----------+---------------+--------------+-----------
6            | 9.99     | 279.00        | 104.548333   | 430

(1 rows affected)`,
      steps: [
        "<code>COUNT(*) AS ProductCount</code> : le nombre de lignes de la table, 6.",
        "<code>MIN(Price)</code> et <code>MAX(Price)</code> : le Câble USB-C à 9.99 et l'Écran à 279.00.",
        "<code>AVG(Price)</code> : 627.29 / 6 = 104.548333… SQL Server garde 6 décimales pour la moyenne d'un <code>DECIMAL(10,2)</code>.",
        "<code>SUM(Stock)</code> : 25 + 80 + 10 + 0 + 300 + 15 = 430.",
        "<code>FROM Products;</code> sans <code>GROUP BY</code> : toute la table forme un seul groupe, donc une seule ligne."
      ]
    },
    {
      title: "Compter et additionner par groupe",
      code: `-- Combien de commandes par statut ?
SELECT Status, COUNT(*) AS OrderCount
FROM Orders
GROUP BY Status
ORDER BY OrderCount DESC, Status;

-- Montant de chaque commande (somme de ses lignes)
SELECT OrderId,
       COUNT(*)                 AS LineCount,
       SUM(Quantity * UnitPrice) AS Total
FROM OrderLines
GROUP BY OrderId
ORDER BY OrderId;`,
      output: `Status    | OrderCount
----------+-----------
Paid      | 2
Cancelled | 1
Pending   | 1
Shipped   | 1

(4 rows affected)
OrderId | LineCount | Total
--------+-----------+-------
1       | 2         | 129.40
2       | 1         | 279.00
3       | 2         | 59.48
4       | 2         | 178.97
5       | 1         | 89.90

(5 rows affected)`,
      steps: [
        "<code>GROUP BY Status</code> : un groupe par statut. <code>Status</code> peut donc apparaître dans le <code>SELECT</code>.",
        "<code>COUNT(*) AS OrderCount</code> : le nombre de commandes dans chaque groupe.",
        "<code>ORDER BY OrderCount DESC, Status</code> : le plus fréquent d'abord, puis l'ordre alphabétique pour les égalités.",
        "<code>SUM(Quantity * UnitPrice)</code> : on calcule le total de chaque ligne, puis on additionne dans le groupe.",
        "<code>3 | 2 | 59.48</code> : commande 3 = 2 × 9.99 + 1 × 39.50 = 19.98 + 39.50."
      ],
      explain: "La deuxième requête calcule le montant des commandes sans colonne Total stockée : on ne duplique pas une donnée qu'on peut recalculer."
    },
    {
      title: "Chiffre d'affaires par client, avec HAVING",
      code: `-- Chiffre d'affaires par client (commandes annulées exclues)
SELECT c.Name,
       COUNT(DISTINCT o.Id)          AS Orders,
       SUM(l.Quantity * l.UnitPrice) AS Revenue
FROM Customers AS c
INNER JOIN Orders     AS o ON o.CustomerId = c.Id
INNER JOIN OrderLines AS l ON l.OrderId = o.Id
WHERE o.Status <> 'Cancelled'
GROUP BY c.Id, c.Name
HAVING SUM(l.Quantity * l.UnitPrice) > 100
ORDER BY Revenue DESC;`,
      output: `Name          | Orders | Revenue
--------------+--------+--------
Alice Martin  | 2      | 408.40
Chloé Bernard | 1      | 178.97

(2 rows affected)`,
      steps: [
        "<code>INNER JOIN Orders … INNER JOIN OrderLines …</code> : on assemble clients, commandes et lignes.",
        "<code>WHERE o.Status &lt;&gt; 'Cancelled'</code> : filtre sur les lignes, avant de regrouper. La commande 5 de Bob disparaît.",
        "<code>GROUP BY c.Id, c.Name</code> : un groupe par client.",
        "<code>COUNT(DISTINCT o.Id)</code> : Alice a 3 lignes de commande mais 2 commandes. <code>DISTINCT</code> évite de compter 3.",
        "<code>HAVING SUM(…) &gt; 100</code> : filtre sur le total du groupe. Bob (59.48) est écarté.",
        "<code>Alice Martin | 2 | 408.40</code> : 129.40 (commande 1) + 279.00 (commande 2)."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Commandes par client",
      prompt: `<p>Affiche, pour chaque <code>CustomerId</code> présent dans <code>Orders</code>, le nombre de commandes, trié par <code>CustomerId</code>.</p>`,
      hint: `<p>Une seule table suffit : <code>GROUP BY CustomerId</code> et <code>COUNT(*)</code>.</p>`,
      solution: `SELECT CustomerId, COUNT(*) AS OrderCount
FROM Orders
GROUP BY CustomerId
ORDER BY CustomerId;
-- 1 -> 2, 2 -> 2, 3 -> 1`
    },
    {
      level: "moyen",
      title: "Quantités vendues, même à zéro",
      prompt: `<p>Affiche le nom de <strong>chaque</strong> produit et la quantité totale vendue (toutes commandes confondues). Un produit jamais vendu doit afficher 0, pas NULL. Trie de la plus grande quantité à la plus petite, puis par nom.</p>`,
      hint: `<p><code>LEFT JOIN OrderLines</code> garde les produits sans ligne. <code>SUM</code> sur aucune valeur donne NULL : entoure-le de <code>ISNULL(…, 0)</code>.</p>`,
      solution: `SELECT p.Name,
       ISNULL(SUM(l.Quantity), 0) AS QuantitySold
FROM Products AS p
LEFT JOIN OrderLines AS l ON l.ProductId = p.Id
GROUP BY p.Id, p.Name
ORDER BY QuantitySold DESC, p.Name;
-- Câble USB-C 5, Clavier mécanique 2, Souris sans fil 2, Casque audio 1,
-- Écran 27 pouces 1, Webcam HD 0`
    },
    {
      level: "difficile",
      title: "Chiffre d'affaires mensuel",
      prompt: `<p>Calcule, pour chaque mois, le nombre de commandes et le chiffre d'affaires, en ignorant les commandes annulées. Ne garde que les mois dont le chiffre d'affaires dépasse 200 €. Trie par année puis par mois.</p>`,
      hint: `<p><code>YEAR(OrderDate)</code> et <code>MONTH(OrderDate)</code> extraient l'année et le mois. Il faut les répéter dans le <code>GROUP BY</code>. Pense à <code>COUNT(DISTINCT …)</code>.</p>`,
      solution: `SELECT YEAR(o.OrderDate)             AS OrderYear,
       MONTH(o.OrderDate)            AS OrderMonth,
       COUNT(DISTINCT o.Id)          AS Orders,
       SUM(l.Quantity * l.UnitPrice) AS Revenue
FROM Orders AS o
INNER JOIN OrderLines AS l ON l.OrderId = o.Id
WHERE o.Status <> 'Cancelled'
GROUP BY YEAR(o.OrderDate), MONTH(o.OrderDate)
HAVING SUM(l.Quantity * l.UnitPrice) > 200
ORDER BY OrderYear, OrderMonth;
-- 2026 | 3 | 3 | 467.88   (avril, 178.97, est écarté par le HAVING)`
    }
  ],
  quiz: [
    {
      q: `Pourquoi <code>SELECT Status, OrderDate, COUNT(*) FROM Orders GROUP BY Status</code> échoue-t-il ?`,
      options: ["<code>COUNT(*)</code> est interdit avec GROUP BY", "<code>OrderDate</code> n'est ni dans le GROUP BY ni dans un agrégat", "Il manque un <code>HAVING</code>"],
      answer: 1,
      why: `Un groupe « Paid » contient deux commandes avec deux dates : SQL Server ne sait pas laquelle afficher. Ajoute <code>OrderDate</code> au GROUP BY, ou utilise <code>MAX(OrderDate)</code>.`
    },
    {
      q: `Où mets-tu la condition « seulement les clients avec au moins 2 commandes » ?`,
      options: ["Dans <code>HAVING COUNT(*) &gt;= 2</code>", "Dans <code>WHERE COUNT(*) &gt;= 2</code>", "Dans <code>ORDER BY</code>"],
      answer: 0,
      why: `La condition porte sur un agrégat, calculé après le regroupement : c'est le rôle de <code>HAVING</code>. <code>WHERE</code> est évalué avant, il ne connaît pas encore <code>COUNT</code>.`
    },
    {
      q: `Que renvoie <code>SUM(Quantity)</code> pour un produit qui n'a aucune ligne de commande (après un LEFT JOIN) ?`,
      options: ["0", "Une erreur", "NULL"],
      answer: 2,
      why: `<code>SUM</code> ignore les NULL ; s'il n'y a aucune valeur, il renvoie NULL. D'où <code>ISNULL(SUM(Quantity), 0)</code> pour afficher 0.`
    },
    {
      q: `Après une jointure Orders + OrderLines, pourquoi utiliser <code>COUNT(DISTINCT o.Id)</code> ?`,
      options: ["Pour ignorer les NULL", "Parce que chaque commande est répétée autant de fois qu'elle a de lignes", "Pour trier les commandes"],
      answer: 1,
      why: `La jointure produit une ligne par ligne de commande. <code>COUNT(o.Id)</code> compterait 3 pour une cliente qui a 2 commandes et 3 lignes. <code>DISTINCT</code> compte chaque commande une fois.`
    }
  ],
  project: `<p><strong>OrderFlow : le tableau de bord.</strong> Crée <code>database/11-dashboard.sql</code> avec trois requêtes : le nombre de commandes par statut, les 3 produits les plus vendus (en quantité, commandes annulées exclues) et le chiffre d'affaires par client, clients sans commande compris (0 €). Ces requêtes alimenteront plus tard un endpoint <code>GET /api/dashboard</code>.</p>`,
  resources: [
    { label: "SELECT - GROUP BY (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/select-group-by-transact-sql" },
    { label: "Fonctions d'agrégation (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/functions/aggregate-functions-transact-sql" }
  ]
});

// =====================================================================
// 6. Modifier des données : INSERT, UPDATE, DELETE
// =====================================================================
window.COURSE.push({
  key: "sql-modify",
  title: "Modifier des données : INSERT, UPDATE, DELETE",
  summary: "Tu sauras ajouter, modifier et supprimer des lignes sans casse, et récupérer ce qui a changé avec OUTPUT.",
  objectives: [
    "Insérer une ou plusieurs lignes avec INSERT",
    "Récupérer l'Id généré avec OUTPUT INSERTED",
    "Modifier avec UPDATE et supprimer avec DELETE en vérifiant le WHERE",
    "Respecter les clés étrangères lors d'une suppression"
  ],
  analogy: `<p>Modifier une base, c'est comme utiliser un <strong>tampon encreur sur un registre</strong> : une fois appuyé, c'est écrit. Un bon comptable relit d'abord la ligne qu'il va tamponner, puis tamponne exactement celle-là.</p>
<p>En SQL, « relire d'abord », c'est lancer un <code>SELECT</code> avec le même <code>WHERE</code> avant un <code>UPDATE</code> ou un <code>DELETE</code>. Ça prend dix secondes et ça évite les catastrophes.</p>`,
  lesson: `<h3>Repartir d'une base propre</h3>
<p>Cette leçon modifie les données. Avant chaque exemple, relance <code>01-schema.sql</code> puis <code>02-seed.sql</code> : tu retrouves exactement les mêmes données et les mêmes <code>Id</code> que dans les sorties affichées.</p>

<h3>INSERT : ajouter des lignes</h3>
<p><code>INSERT INTO Table (colonnes) VALUES (valeurs)</code> ajoute une ligne. Liste toujours les colonnes : l'ordre des valeurs suit cette liste, et ton script continue de marcher si une colonne est ajoutée plus tard. Les colonnes absentes reçoivent leur <code>DEFAULT</code>, ou <code>NULL</code> si elles l'acceptent ; sinon l'insertion est refusée.</p>
<p>Plusieurs lignes d'un coup ? Sépare les parenthèses par des virgules : <code>VALUES (…), (…), (…)</code>. C'est une seule instruction, donc tout passe ou rien ne passe.</p>

<h3>OUTPUT : voir ce qui a changé</h3>
<p>Après un <code>INSERT</code>, ton application a souvent besoin de l'<code>Id</code> que SQL Server vient de générer (pour renvoyer <code>201 Created</code> avec l'adresse de la ressource, par exemple). La clause <code>OUTPUT INSERTED.Id</code> le renvoie directement, dans la même instruction, sans seconde requête.</p>
<p><code>OUTPUT</code> marche aussi avec <code>UPDATE</code> et <code>DELETE</code>, grâce à deux tables virtuelles :</p>
<div class="compare"><div><h4>INSERTED</h4><p>Les valeurs <strong>après</strong> l'opération. Disponible pour INSERT et UPDATE.</p></div><div><h4>DELETED</h4><p>Les valeurs <strong>avant</strong> l'opération. Disponible pour UPDATE et DELETE.</p></div></div>

<h3>UPDATE : modifier des lignes</h3>
<p><code>UPDATE Products SET Price = 45 WHERE Id = 2;</code> modifie la colonne <code>Price</code> des lignes qui respectent le <code>WHERE</code>. On peut changer plusieurs colonnes (<code>SET Price = …, Stock = …</code>) et utiliser l'ancienne valeur dans le calcul : <code>SET Stock = Stock - 1</code>.</p>
<div class="flow"><span>SELECT … WHERE</span><span>Vérifier les lignes</span><span>UPDATE … WHERE (même filtre)</span><span>Vérifier le nombre de lignes</span></div>
<div class="tip">Un <code>UPDATE</code> ou un <code>DELETE</code> <strong>sans WHERE</strong> touche toute la table. <code>UPDATE Products SET Price = 0;</code> met tout le catalogue à zéro, sans confirmation. Écris toujours le <code>WHERE</code> en premier, et teste-le avec un <code>SELECT</code>.</div>

<h3>DELETE : supprimer des lignes</h3>
<p><code>DELETE FROM Orders WHERE Id = 5;</code> supprime les lignes ciblées. Mais si d'autres lignes pointent vers elles par une clé étrangère, SQL Server <strong>refuse</strong> : on ne peut pas supprimer une commande qui a encore des lignes. Il faut supprimer dans l'ordre <strong>enfants puis parent</strong>.</p>
<pre class="diagram">
 Supprimer la commande 5 :

 1) DELETE OrderLines WHERE OrderId = 5
          |  (plus personne ne pointe
          v   vers la commande 5)
 2) DELETE Orders WHERE Id = 5      OK
</pre>
<p>On peut aussi déclarer la clé étrangère avec <code>ON DELETE CASCADE</code> pour que les lignes enfants partent toutes seules. C'est pratique pour des lignes de commande, dangereux pour des clients : une suppression en cascade peut emporter beaucoup plus que prévu.</p>

<h3>Le nombre de lignes touchées</h3>
<p>sqlcmd affiche <code>(n rows affected)</code> après chaque instruction. En C#, <code>ExecuteNonQuery()</code> te renverra ce même nombre : 0 veut souvent dire « l'Id n'existe pas », et ton API renverra alors <code>404 Not Found</code>.</p>
<div class="note">En entreprise, on supprime rarement pour de vrai les données métier. On préfère une <strong>suppression logique</strong> : une colonne <code>IsDeleted</code> ou un statut <code>Cancelled</code>. L'historique reste intact (factures, statistiques, audit) et une erreur se corrige d'un simple <code>UPDATE</code>.</div>`,
  examples: [
    {
      title: "INSERT et récupération de l'Id",
      code: `-- Ajouter un client et récupérer l'Id que SQL Server lui a donné
INSERT INTO Customers (Name, Email)
OUTPUT INSERTED.Id, INSERTED.Name
VALUES (N'Emma Leroy', N'emma@example.com');

-- Ajouter deux produits d'un coup
INSERT INTO Products (Name, Price, Stock) VALUES
 (N'Tapis de souris', 12.90, 50),
 (N'Hub USB',         24.00, 20);

SELECT Id, Name, Price FROM Products WHERE Id > 6;`,
      output: `Id | Name
---+-----------
5  | Emma Leroy

(1 rows affected)

(2 rows affected)
Id | Name            | Price
---+-----------------+------
7  | Tapis de souris | 12.90
8  | Hub USB         | 24.00

(2 rows affected)`,
      steps: [
        "<code>INSERT INTO Customers (Name, Email)</code> : on ne fournit ni <code>Id</code> (IDENTITY) ni <code>CreatedAt</code> (DEFAULT).",
        "<code>OUTPUT INSERTED.Id, INSERTED.Name</code> : se place entre la liste des colonnes et <code>VALUES</code>. Il renvoie un tableau avec la ligne insérée : Emma a l'<code>Id</code> 5.",
        "<code>VALUES (N'Tapis de souris', 12.90, 50), (N'Hub USB', 24.00, 20)</code> : deux lignes en une instruction, d'où « (2 rows affected) ».",
        "<code>WHERE Id &gt; 6</code> : les produits du seed vont de 1 à 6, les nouveaux reçoivent 7 et 8."
      ],
      explain: "Une insertion refusée (email en double, par exemple) consomme quand même un numéro IDENTITY : les Id peuvent avoir des trous, c'est normal."
    },
    {
      title: "UPDATE avec vérification et avant/après",
      code: `-- 1) On vérifie d'abord QUI sera touché, avec un SELECT
SELECT Id, Name, Price FROM Products WHERE Price < 50;

-- 2) Même WHERE, cette fois on augmente le prix de 10 %
UPDATE Products
SET Price = ROUND(Price * 1.10, 2)
OUTPUT INSERTED.Id, DELETED.Price AS OldPrice, INSERTED.Price AS NewPrice
WHERE Price < 50;

-- 3) Passer la commande 2 au statut Paid
UPDATE Orders SET Status = 'Paid' WHERE Id = 2;`,
      output: `Id | Name            | Price
---+-----------------+------
2  | Souris sans fil | 39.50
5  | Câble USB-C     | 9.99

(2 rows affected)
Id | OldPrice | NewPrice
---+----------+---------
2  | 39.50    | 43.45
5  | 9.99     | 10.99

(2 rows affected)

(1 rows affected)`,
      steps: [
        "<code>SELECT … WHERE Price &lt; 50</code> : deux produits seront touchés. Si on en voyait 200, on s'arrêterait là.",
        "<code>SET Price = ROUND(Price * 1.10, 2)</code> : la nouvelle valeur est calculée à partir de l'ancienne, arrondie à 2 décimales.",
        "<code>OUTPUT … DELETED.Price AS OldPrice, INSERTED.Price AS NewPrice</code> : l'avant et l'après de chaque ligne modifiée.",
        "<code>9.99 → 10.99</code> : 9.99 × 1.10 = 10.989, arrondi à 10.99.",
        "<code>UPDATE Orders SET Status = 'Paid' WHERE Id = 2;</code> : la forme la plus courante, ciblée par la clé primaire. « (1 rows affected) » confirme qu'une ligne a changé."
      ]
    },
    {
      title: "DELETE et clé étrangère",
      code: `-- Supprimer la commande annulée n° 5 directement : refusé
DELETE FROM Orders WHERE Id = 5;

-- Il faut d'abord supprimer ses lignes, puis la commande
DELETE FROM OrderLines
OUTPUT DELETED.Id, DELETED.ProductId
WHERE OrderId = 5;

DELETE FROM Orders WHERE Id = 5;

SELECT COUNT(*) AS Orders FROM Orders;`,
      output: `Msg 547, Level 16, State 1, Server MONPC\\LOCALDB#1A2B3C4D, Line 2
The DELETE statement conflicted with the REFERENCE constraint "FK_OrderLines_Orders". The conflict occurred in database "OrderFlow", table "dbo.OrderLines", column 'OrderId'.
The statement has been terminated.
Id | ProductId
---+----------
8  | 1

(1 rows affected)

(1 rows affected)
Orders
------
4

(1 rows affected)`,
      steps: [
        "<code>DELETE FROM Orders WHERE Id = 5;</code> : refusé (erreur 547) car la ligne 8 de <code>OrderLines</code> pointe encore vers la commande 5.",
        "<code>The DELETE statement conflicted with the REFERENCE constraint \"FK_OrderLines_Orders\"</code> : le nom de la contrainte dit exactement quelle table bloque.",
        "<code>DELETE FROM OrderLines OUTPUT DELETED.Id, DELETED.ProductId WHERE OrderId = 5;</code> : on supprime l'enfant d'abord, et <code>OUTPUT</code> montre ce qui est parti.",
        "<code>DELETE FROM Orders WHERE Id = 5;</code> : plus rien ne pointe vers elle, la suppression passe.",
        "<code>SELECT COUNT(*) AS Orders</code> : il reste 4 commandes."
      ],
      explain: "Si la suppression des lignes réussit mais pas celle de la commande, la base reste à moitié modifiée. La leçon sur les transactions règle ce problème."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un nouveau produit",
      prompt: `<p>Ajoute le produit « Support pour écran » à 34,90 € avec un stock de 12, et affiche en retour son <code>Id</code>, son nom et son prix grâce à <code>OUTPUT</code>.</p>`,
      hint: `<p><code>OUTPUT INSERTED.…</code> se place juste avant <code>VALUES</code>.</p>`,
      solution: `INSERT INTO Products (Name, Price, Stock)
OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Price
VALUES (N'Support pour écran', 34.90, 12);
-- Id 7 sur une base fraîchement rechargée`
    },
    {
      level: "moyen",
      title: "Annuler les commandes oubliées",
      prompt: `<p>Les commandes encore au statut <code>Pending</code> passées <strong>avant le 1<sup>er</sup> avril 2026</strong> doivent passer au statut <code>Cancelled</code>. Vérifie d'abord avec un <code>SELECT</code>, puis fais la mise à jour en affichant pour chaque ligne l'<code>Id</code>, l'ancien et le nouveau statut.</p>`,
      hint: `<p>Le même <code>WHERE</code> deux fois. Dans <code>OUTPUT</code>, <code>DELETED.Status</code> est l'ancien statut, <code>INSERTED.Status</code> le nouveau.</p>`,
      solution: `-- Qui sera touché ?
SELECT Id, OrderDate, Status
FROM Orders
WHERE Status = 'Pending' AND OrderDate < '2026-04-01';

-- On annule, en gardant une trace
UPDATE Orders
SET Status = 'Cancelled'
OUTPUT INSERTED.Id, DELETED.Status AS OldStatus, INSERTED.Status AS NewStatus
WHERE Status = 'Pending' AND OrderDate < '2026-04-01';
-- Commande 2 : Pending -> Cancelled`
    },
    {
      level: "difficile",
      title: "Supprimer un client et tout son historique",
      prompt: `<p>Supprime le client n° 2 (Bob) avec <strong>toutes</strong> ses commandes et toutes leurs lignes, sans erreur de clé étrangère. Affiche ensuite les clients restants. Tu ne connais pas les numéros des commandes de Bob à l'avance.</p>`,
      hint: `<p>Ordre : <code>OrderLines</code>, puis <code>Orders</code>, puis <code>Customers</code>. Pour les lignes, utilise une sous-requête : <code>WHERE OrderId IN (SELECT Id FROM Orders WHERE CustomerId = 2)</code>.</p>`,
      solution: `-- Des enfants vers le parent
DELETE FROM OrderLines
WHERE OrderId IN (SELECT Id FROM Orders WHERE CustomerId = 2);   -- 3 lignes

DELETE FROM Orders WHERE CustomerId = 2;                          -- 2 commandes

DELETE FROM Customers WHERE Id = 2;                               -- 1 client

SELECT Id, Name FROM Customers;  -- Alice, Chloé, David

-- Relance 01-schema.sql et 02-seed.sql pour retrouver Bob`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>UPDATE Products SET Stock = 0;</code> ?`,
      options: ["Rien, il manque le WHERE", "Il met le stock de <strong>tous</strong> les produits à 0", "Il demande une confirmation"],
      answer: 1,
      why: `Sans <code>WHERE</code>, l'instruction s'applique à toutes les lignes, sans avertissement. C'est l'erreur la plus coûteuse en SQL : écris toujours le WHERE d'abord.`
    },
    {
      q: `Dans un <code>UPDATE</code>, que contient <code>DELETED.Price</code> ?`,
      options: ["Le prix avant la modification", "Le prix après la modification", "NULL, car rien n'est supprimé"],
      answer: 0,
      why: `Pour un UPDATE, <code>DELETED</code> contient les anciennes valeurs et <code>INSERTED</code> les nouvelles. Le nom vient du fait qu'un UPDATE « remplace » l'ancienne version de la ligne.`
    },
    {
      q: `<code>DELETE FROM Customers WHERE Id = 1;</code> échoue avec l'erreur 547. Pourquoi ?`,
      options: ["Le client 1 n'existe pas", "Il faut <code>DELETE *</code>", "Des commandes pointent encore vers ce client"],
      answer: 2,
      why: `L'erreur 547 signale une contrainte violée, ici la clé étrangère <code>FK_Orders_Customers</code>. Si le client n'existait pas, le DELETE réussirait avec « (0 rows affected) ».`
    },
    {
      q: `Quel est l'intérêt de <code>OUTPUT INSERTED.Id</code> dans un INSERT ?`,
      options: ["Vérifier que l'Id est unique", "Récupérer l'Id généré sans faire de seconde requête", "Choisir soi-même l'Id"],
      answer: 1,
      why: `IDENTITY génère l'Id côté serveur. OUTPUT le renvoie dans la même instruction : c'est ce que ton code C# lira pour connaître l'Id du nouveau client.`
    }
  ],
  project: `<p><strong>OrderFlow : passer une commande, version naïve.</strong> Dans <code>database/12-place-order.sql</code>, écris les trois étapes d'une commande pour le client 4 (David) : insérer la commande avec <code>OUTPUT INSERTED.Id</code>, insérer deux lignes (2 souris, 1 clavier, au prix du catalogue), puis diminuer le stock des deux produits. Lance-le, puis demande-toi : que se passe-t-il si la troisième étape échoue ? Note ta réponse en commentaire, on corrige ça avec les transactions.</p>`,
  resources: [
    { label: "INSERT (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/statements/insert-transact-sql" },
    { label: "Clause OUTPUT (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/queries/output-clause-transact-sql" }
  ]
});

// =====================================================================
// 7. Index et plan d'exécution
// =====================================================================
window.COURSE.push({
  key: "sql-indexes",
  title: "Index et plan d'exécution",
  summary: "Tu sauras créer les index utiles d'OrderFlow, lire un plan d'exécution simple et mesurer le gain d'un index.",
  objectives: [
    "Comprendre ce qu'est un index et la différence entre scan et seek",
    "Distinguer index clustered et non clustered",
    "Créer un index, y compris sur les clés étrangères et avec INCLUDE",
    "Lire un plan avec SHOWPLAN_TEXT et mesurer avec STATISTICS IO"
  ],
  analogy: `<p>Pour trouver « transaction » dans un gros livre de cours, tu ne lis pas les 800 pages : tu vas à l'<strong>index</strong> à la fin, trié par ordre alphabétique, qui te donne directement la page 412.</p>
<p>Un index SQL, c'est pareil : une liste triée qui mène droit aux bonnes lignes. Sans lui, SQL Server doit feuilleter toute la table. Mais chaque nouveau mot ajouté au livre oblige aussi à mettre l'index à jour.</p>`,
  lesson: `<h3>Scan ou seek</h3>
<p>Quand tu écris <code>WHERE Email = 'bob@example.com'</code>, SQL Server a deux façons de trouver la ligne. Un <strong>scan</strong> lit toute la table, ligne après ligne. Un <strong>seek</strong> utilise un index trié pour sauter directement au bon endroit, comme une recherche dichotomique.</p>
<div class="compare"><div><h4>Scan</h4><p>Lit tout. Coût proportionnel à la taille de la table : invisible sur 6 lignes, catastrophique sur 10 millions.</p></div><div><h4>Seek</h4><p>Va droit au but. Coût presque constant, quelle que soit la taille de la table.</p></div></div>
<p>Sur nos petites tables, tout est instantané. Les index deviennent indispensables dès quelques dizaines de milliers de lignes, c'est-à-dire très vite en production.</p>

<h3>Clustered et non clustered</h3>
<p>L'index <strong>clustered</strong> (ou « cluster »), c'est la table elle-même, rangée dans l'ordre de sa clé. Il n'y en a qu'un par table, et SQL Server le crée automatiquement sur la clé primaire : c'est <code>PK_Customers</code>.</p>
<p>Un index <strong>non clustered</strong> est une structure à part : une copie triée de quelques colonnes, avec pour chaque entrée la clé primaire de la ligne complète. La contrainte <code>UNIQUE</code> sur l'email en a créé un : <code>UQ_Customers_Email</code>.</p>
<pre class="diagram">
 UQ_Customers_Email        PK_Customers (la table)
 (trié par Email)          (trié par Id)
 alice@... -&gt; Id 1         1 | Alice Martin  | ...
 bob@...   -&gt; Id 2  ----&gt;  2 | Bob Durand    | ...
 chloe@... -&gt; Id 3         3 | Chloé Bernard | ...
 david@... -&gt; Id 4         4 | David Petit   | ...
</pre>
<p>Pour lire le nom de Bob, SQL Server fait un seek dans l'index des emails, trouve l'<code>Id</code> 2, puis va chercher la ligne dans la table : ce deuxième saut s'appelle un <strong>Key Lookup</strong>.</p>

<h3>Créer un index</h3>
<p>La syntaxe est courte : <code>CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);</code>. Le préfixe <code>IX_</code> est une convention de nommage. Un index peut porter sur plusieurs colonnes (<code>(CustomerId, Status)</code>) : l'ordre compte, comme un annuaire trié par nom puis prénom.</p>
<p>Avec <code>INCLUDE (Email)</code>, tu ajoutes des colonnes stockées dans l'index sans servir au tri. Si l'index contient toutes les colonnes dont la requête a besoin, on dit qu'il est <strong>couvrant</strong> : plus de Key Lookup.</p>
<div class="tip">SQL Server crée un index pour chaque clé primaire et chaque contrainte UNIQUE, mais <strong>jamais pour les clés étrangères</strong>. Or on joint et on filtre sans arrêt sur <code>CustomerId</code>, <code>OrderId</code>, <code>ProductId</code> : crée ces index toi-même.</div>

<h3>Le prix d'un index</h3>
<p>Un index accélère les lectures mais ralentit chaque <code>INSERT</code>, <code>UPDATE</code> et <code>DELETE</code> (il faut le tenir à jour) et prend de la place. On indexe donc les colonnes réellement utilisées dans les <code>WHERE</code>, <code>JOIN</code> et <code>ORDER BY</code> fréquents, pas toutes les colonnes « au cas où ».</p>

<h3>Lire le plan d'exécution</h3>
<p>Le <strong>plan d'exécution</strong> est la recette choisie par SQL Server pour répondre à ta requête. <code>SET SHOWPLAN_TEXT ON</code> l'affiche en texte au lieu d'exécuter la requête. Dans SSMS, <kbd>Ctrl</kbd>+<kbd>M</kbd> affiche le plan réel sous forme graphique.</p>
<div class="flow"><span>Requête</span><span>Optimiseur</span><span>Plan : Seek ou Scan ?</span><span>Exécution</span></div>
<p>Pour mesurer, <code>SET STATISTICS IO ON</code> affiche les <strong>logical reads</strong> : le nombre de pages de 8 Ko lues. C'est la mesure la plus fiable pour comparer deux versions d'une requête, bien plus que le temps, qui varie d'un essai à l'autre.</p>
<div class="note">En production, ne devine pas : regarde le plan sur un volume réaliste. Trois signaux d'alerte : un <em>Scan</em> sur une grosse table, un <em>Key Lookup</em> répété des milliers de fois (index non couvrant), et un écart énorme entre lignes estimées et lignes réelles (statistiques obsolètes).</div>`,
  examples: [
    {
      title: "Indexer les clés étrangères et lister les index",
      code: `-- Index sur les clés étrangères : SQL Server ne les crée pas tout seul
CREATE INDEX IX_Orders_CustomerId    ON Orders(CustomerId);
CREATE INDEX IX_OrderLines_OrderId   ON OrderLines(OrderId);
CREATE INDEX IX_OrderLines_ProductId ON OrderLines(ProductId);

-- La liste de tous les index de la base
SELECT t.name AS TableName, i.name AS IndexName, i.type_desc AS IndexType
FROM sys.indexes AS i
INNER JOIN sys.tables AS t ON t.object_id = i.object_id
WHERE i.name IS NOT NULL
ORDER BY t.name, i.name;`,
      output: `TableName  | IndexName               | IndexType
-----------+-------------------------+-------------
Customers  | PK_Customers            | CLUSTERED
Customers  | UQ_Customers_Email      | NONCLUSTERED
OrderLines | IX_OrderLines_OrderId   | NONCLUSTERED
OrderLines | IX_OrderLines_ProductId | NONCLUSTERED
OrderLines | PK_OrderLines           | CLUSTERED
Orders     | IX_Orders_CustomerId    | NONCLUSTERED
Orders     | PK_Orders               | CLUSTERED
Products   | PK_Products             | CLUSTERED

(8 rows affected)`,
      steps: [
        "<code>CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);</code> : un index non clustered (le défaut) sur la clé étrangère. Les jointures clients-commandes en profitent.",
        "<code>sys.indexes</code> et <code>sys.tables</code> : des vues système qui décrivent la base elle-même. On les joint comme des tables normales.",
        "<code>WHERE i.name IS NOT NULL</code> : écarte les entrées sans nom (les tables sans index clustered en ont une).",
        "<code>PK_… | CLUSTERED</code> : chaque clé primaire a créé l'index clustered de sa table.",
        "<code>UQ_Customers_Email | NONCLUSTERED</code> : la contrainte UNIQUE a créé un index, utilisable pour les recherches par email."
      ],
      explain: "Enregistre les trois CREATE INDEX dans database/03-indexes.sql et lance-le après 01-schema.sql."
    },
    {
      title: "Voir le plan : seek ou scan ?",
      code: `-- Affiche le plan prévu au lieu d'exécuter la requête
SET SHOWPLAN_TEXT ON;
GO
SELECT Id, Name FROM Customers WHERE Email = N'bob@example.com';
GO
SELECT Id, Email FROM Customers WHERE Name = N'Bob Durand';
GO
SET SHOWPLAN_TEXT OFF;
GO`,
      output: `StmtText
--------
SELECT Id, Name FROM Customers WHERE Email = N'bob@example.com';

(1 rows affected)
StmtText
--------
  |--Nested Loops(Inner Join, OUTER REFERENCES:([OrderFlow].[dbo].[Customers].[Id]))
       |--Index Seek(OBJECT:([OrderFlow].[dbo].[Customers].[UQ_Customers_Email]), SEEK:([OrderFlow].[dbo].[Customers].[Email]=[@1]) ORDERED FORWARD)
       |--Clustered Index Seek(OBJECT:([OrderFlow].[dbo].[Customers].[PK_Customers]), SEEK:([OrderFlow].[dbo].[Customers].[Id]=[OrderFlow].[dbo].[Customers].[Id]) LOOKUP ORDERED FORWARD)

(3 rows affected)
StmtText
--------
SELECT Id, Email FROM Customers WHERE Name = N'Bob Durand';

(1 rows affected)
StmtText
--------
  |--Clustered Index Scan(OBJECT:([OrderFlow].[dbo].[Customers].[PK_Customers]), WHERE:([OrderFlow].[dbo].[Customers].[Name]=[@1]))

(1 rows affected)`,
      steps: [
        "<code>SET SHOWPLAN_TEXT ON;</code> suivi de <code>GO</code> : ce réglage doit être seul dans son lot. Ensuite, les requêtes ne sont plus exécutées : sqlcmd affiche le texte de la requête puis son plan.",
        "<code>Index Seek(… [UQ_Customers_Email] …)</code> : la recherche par email saute directement dans l'index créé par la contrainte UNIQUE.",
        "<code>Clustered Index Seek(… [PK_Customers] … LOOKUP …)</code> : le Key Lookup. L'index des emails ne contient pas <code>Name</code>, il faut aller le chercher dans la table.",
        "<code>Nested Loops</code> : l'opération qui assemble les deux, une boucle « pour chaque entrée trouvée, va chercher la ligne ». Un plan texte se lit de l'intérieur (les lignes indentées) vers l'extérieur.",
        "<code>Clustered Index Scan(… WHERE: … [Name]=[@1])</code> : aucun index sur <code>Name</code>, SQL Server parcourt toute la table et teste chaque ligne.",
        "<code>[@1]</code> : SQL Server a remplacé la valeur par un paramètre pour réutiliser le plan. Tu feras pareil en C# avec des requêtes paramétrées."
      ]
    },
    {
      title: "Mesurer le gain sur 100 000 commandes",
      code: `SET NOCOUNT ON;
-- 1) 100 000 commandes de test, une toutes les 14 minutes
INSERT INTO Orders (CustomerId, OrderDate, Status)
SELECT TOP (100000)
       1 + ABS(CHECKSUM(NEWID())) % 4,
       DATEADD(MINUTE, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) * 14, '2023-01-01'),
       'Paid'
FROM sys.all_objects AS a CROSS JOIN sys.all_objects AS b;

-- 2) Sans index sur OrderDate : SQL Server lit toute la table
SET STATISTICS IO ON;
SELECT COUNT(*) AS OrdersThatDay FROM Orders
WHERE OrderDate >= '2024-06-01' AND OrderDate < '2024-06-02';
SET STATISTICS IO OFF;

-- 3) On crée l'index, puis on relance la même requête
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
SET STATISTICS IO ON;
SELECT COUNT(*) AS OrdersThatDay FROM Orders
WHERE OrderDate >= '2024-06-01' AND OrderDate < '2024-06-02';
SET STATISTICS IO OFF;`,
      output: `OrdersThatDay
-------------
102
Table 'Orders'. Scan count 1, logical reads 435, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.
OrdersThatDay
-------------
102
Table 'Orders'. Scan count 1, logical reads 2, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.`,
      steps: [
        "<code>SELECT TOP (100000) … FROM sys.all_objects AS a CROSS JOIN sys.all_objects AS b</code> : une astuce pour fabriquer beaucoup de lignes. Le <code>CROSS JOIN</code> associe chaque ligne de gauche à chaque ligne de droite, et <code>TOP</code> en garde 100 000.",
        "<code>1 + ABS(CHECKSUM(NEWID())) % 4</code> : un client au hasard entre 1 et 4. <code>DATEADD(MINUTE, ROW_NUMBER() … * 14, '2023-01-01')</code> : une commande toutes les 14 minutes, soit environ 970 jours.",
        "<code>SET STATISTICS IO ON;</code> : SQL Server affiche les pages lues après chaque requête.",
        "<code>logical reads 435</code> : sans index, toute la table (435 pages de 8 Ko) est lue pour trouver 102 commandes.",
        "<code>CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);</code> : l'index trié par date.",
        "<code>logical reads 2</code> : même résultat, 200 fois moins de lecture. L'index couvre la requête car elle ne lit que <code>OrderDate</code>."
      ],
      explain: "Le chiffre exact de pages peut légèrement varier selon la version de SQL Server. Relance ensuite 01-schema.sql et 02-seed.sql pour retrouver les données de départ."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un index sur le nom des produits",
      prompt: `<p>Le catalogue sera souvent trié et filtré par nom. Crée l'index <code>IX_Products_Name</code> sur <code>Products(Name)</code>, puis affiche le nom et le type de tous les index de la table <code>Products</code>.</p>`,
      hint: `<p><code>OBJECT_ID('Products')</code> renvoie l'identifiant de la table : filtre <code>sys.indexes</code> sur <code>object_id</code>.</p>`,
      solution: `CREATE INDEX IX_Products_Name ON Products(Name);

SELECT name AS IndexName, type_desc AS IndexType
FROM sys.indexes
WHERE object_id = OBJECT_ID('Products') AND name IS NOT NULL;
-- PK_Products CLUSTERED, IX_Products_Name NONCLUSTERED`
    },
    {
      level: "moyen",
      title: "Un index couvrant",
      prompt: `<p>La requête <code>SELECT Id, Email FROM Customers WHERE Name = N'Bob Durand';</code> fait un scan (exemple 2). Crée un index qui la transforme en <strong>un seul</strong> Index Seek, sans Key Lookup, et vérifie avec <code>SHOWPLAN_TEXT</code>.</p>`,
      hint: `<p>La clé de l'index est la colonne filtrée (<code>Name</code>). Les autres colonnes lues vont dans <code>INCLUDE</code>. <code>Id</code> est déjà présent dans tout index non clustered, car c'est la clé du clustered.</p>`,
      solution: `CREATE INDEX IX_Customers_Name ON Customers(Name) INCLUDE (Email);
GO
SET SHOWPLAN_TEXT ON;
GO
SELECT Id, Email FROM Customers WHERE Name = N'Bob Durand';
GO
SET SHOWPLAN_TEXT OFF;
GO
-- Plan : |--Index Seek(OBJECT:([OrderFlow].[dbo].[Customers].[IX_Customers_Name]), ...)
-- Plus de Nested Loops ni de LOOKUP : l'index couvre la requête`
    },
    {
      level: "difficile",
      title: "Un index sur deux colonnes",
      prompt: `<p>Recharge 100 000 commandes comme dans l'exemple 3, mais avec un statut au hasard parmi les quatre. Mesure avec <code>STATISTICS IO</code> la requête « nombre de commandes <code>Pending</code> du client 3 », crée un index sur <strong>deux colonnes</strong> adapté, puis mesure à nouveau. Explique pourquoi l'ordre des colonnes de l'index compte.</p>`,
      hint: `<p>Pour le statut aléatoire : <code>CASE ABS(CHECKSUM(NEWID())) % 4 WHEN 0 THEN 'Pending' … END</code>. L'index : <code>(CustomerId, Status)</code>.</p>`,
      solution: `SET NOCOUNT ON;
INSERT INTO Orders (CustomerId, OrderDate, Status)
SELECT TOP (100000)
       1 + ABS(CHECKSUM(NEWID())) % 4,
       DATEADD(MINUTE, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) * 14, '2023-01-01'),
       CASE ABS(CHECKSUM(NEWID())) % 4 WHEN 0 THEN 'Pending' WHEN 1 THEN 'Paid'
                                       WHEN 2 THEN 'Shipped' ELSE 'Cancelled' END
FROM sys.all_objects AS a CROSS JOIN sys.all_objects AS b;

SET STATISTICS IO ON;
SELECT COUNT(*) FROM Orders WHERE CustomerId = 3 AND Status = 'Pending';
SET STATISTICS IO OFF;   -- des centaines de logical reads (scan)

CREATE INDEX IX_Orders_CustomerId_Status ON Orders(CustomerId, Status);

SET STATISTICS IO ON;
SELECT COUNT(*) FROM Orders WHERE CustomerId = 3 AND Status = 'Pending';
SET STATISTICS IO OFF;   -- quelques dizaines seulement (seek)

-- L'index est trié par CustomerId, puis par Status à l'intérieur de chaque client,
-- comme un annuaire trié par nom puis prénom. Il sert aussi une requête
-- « WHERE CustomerId = 3 » seule, mais pas efficacement « WHERE Status = 'Pending' » seule :
-- les Pending sont éparpillés dans les quatre clients.`
    }
  ],
  quiz: [
    {
      q: `Combien d'index <strong>clustered</strong> une table peut-elle avoir ?`,
      options: ["Un seul", "Un par colonne", "Autant qu'on veut"],
      answer: 0,
      why: `L'index clustered, c'est l'ordre physique de la table : on ne peut ranger les lignes que dans un seul ordre. Les index non clustered, eux, peuvent être nombreux.`
    },
    {
      q: `Quel index SQL Server crée-t-il <strong>automatiquement</strong> ?`,
      options: ["Un index sur chaque clé étrangère", "Un index pour chaque clé primaire et chaque contrainte UNIQUE", "Un index sur chaque colonne NOT NULL"],
      answer: 1,
      why: `PRIMARY KEY et UNIQUE créent un index. Les clés étrangères, non : c'est un oubli classique qui rend les jointures lentes.`
    },
    {
      q: `Dans un plan, que signale un <em>Key Lookup</em> (Clustered Index Seek … LOOKUP) ?`,
      options: ["Que la table n'a pas de clé primaire", "Une erreur dans la requête", "Que l'index utilisé ne contient pas toutes les colonnes demandées"],
      answer: 2,
      why: `SQL Server a trouvé la ligne via un index non clustered, puis doit aller chercher les colonnes manquantes dans la table. Un <code>INCLUDE</code> rend l'index couvrant et supprime ce saut.`
    },
    {
      q: `Pourquoi ne pas créer un index sur chaque colonne ?`,
      options: ["SQL Server l'interdit", "Chaque index ralentit les écritures et prend de la place", "Les index ne servent qu'aux clés primaires"],
      answer: 1,
      why: `Chaque INSERT, UPDATE ou DELETE doit mettre à jour tous les index concernés. On indexe ce que les requêtes utilisent vraiment.`
    }
  ],
  project: `<p><strong>OrderFlow : les index.</strong> Crée <code>database/03-indexes.sql</code> avec les trois index de clés étrangères de l'exemple 1, plus <code>IX_Orders_OrderDate</code> (les listes de commandes seront triées par date) et <code>IX_Products_Name</code> (le catalogue est trié par nom). Ton ordre de déploiement devient : <code>00-create-database.sql</code>, <code>01-schema.sql</code>, <code>02-seed.sql</code>, <code>03-indexes.sql</code>. Vérifie avec <code>SHOWPLAN_TEXT</code> que la requête de détail de commande de la leçon sur les jointures utilise bien tes index.</p>`,
  resources: [
    { label: "Index cluster et non cluster (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described" },
    { label: "SET STATISTICS IO (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/statements/set-statistics-io-transact-sql" }
  ]
});

// =====================================================================
// 8. Transactions et niveaux d'isolation en SQL
// =====================================================================
window.COURSE.push({
  key: "sql-transactions",
  title: "Transactions et niveaux d'isolation en SQL",
  summary: "Tu sauras regrouper plusieurs écritures en un bloc « tout ou rien », gérer les erreurs avec TRY/CATCH et choisir un niveau d'isolation.",
  objectives: [
    "Ouvrir, valider et annuler une transaction",
    "Rendre un script sûr avec XACT_ABORT, TRY/CATCH et ROLLBACK",
    "Éviter la survente avec une mise à jour conditionnelle",
    "Comprendre les niveaux d'isolation et leurs anomalies"
  ],
  analogy: `<p>Un <strong>virement bancaire</strong> fait deux choses : retirer 100 € d'un compte et ajouter 100 € sur un autre. Si la banque plante entre les deux, l'argent ne doit pas disparaître : soit les deux opérations ont lieu, soit aucune.</p>
<p>Une transaction, c'est cette promesse du « tout ou rien ». Et l'isolation, c'est ce que voit un autre client de la banque pendant que ton virement est en cours.</p>`,
  lesson: `<h3>Le problème : des écritures à moitié faites</h3>
<p>Passer une commande, c'est trois écritures : la commande, ses lignes, la baisse du stock. À la leçon sur les modifications, si la troisième échouait, les deux premières restaient en base : une commande sans stock réservé. Une <strong>transaction</strong> regroupe ces écritures en une seule unité : elles réussissent ensemble ou sont annulées ensemble.</p>
<p>On résume les garanties d'une transaction par <strong>ACID</strong> : <strong>A</strong>tomicité (tout ou rien), <strong>C</strong>ohérence (les contraintes restent vraies), <strong>I</strong>solation (les autres ne voient pas le travail en cours), <strong>D</strong>urabilité (une fois validé, c'est écrit, même si le serveur redémarre).</p>

<h3>BEGIN, COMMIT, ROLLBACK</h3>
<div class="flow"><span>BEGIN TRANSACTION</span><span>INSERT / UPDATE / DELETE</span><span>Tout va bien : COMMIT</span><span>Erreur : ROLLBACK</span></div>
<p><code>BEGIN TRANSACTION</code> ouvre la transaction. <code>COMMIT</code> valide définitivement. <code>ROLLBACK</code> annule tout depuis le <code>BEGIN</code>. Sans <code>BEGIN</code>, chaque instruction est sa propre petite transaction, validée immédiatement : c'est le mode <em>autocommit</em> que tu as utilisé jusqu'ici.</p>
<div class="tip">Une transaction ouverte et jamais terminée garde ses verrous : les autres sessions qui veulent lire ces lignes restent bloquées. <code>SELECT @@TRANCOUNT;</code> affiche le nombre de transactions ouvertes dans ta session. S'il vaut plus que 0 alors que tu as fini, fais <code>COMMIT</code> ou <code>ROLLBACK</code>.</div>

<h3>Gérer les erreurs proprement</h3>
<p>Piège : par défaut, une erreur comme une violation de contrainte <strong>n'annule que l'instruction fautive</strong>. La transaction continue et un <code>COMMIT</code> validerait le reste ! Deux outils règlent ça :</p>
<ul>
<li><code>SET XACT_ABORT ON;</code> : toute erreur annule la transaction entière.</li>
<li><code>BEGIN TRY … END TRY BEGIN CATCH … END CATCH</code> : comme <code>try/catch</code> en C#. Dans le <code>CATCH</code>, on fait <code>ROLLBACK</code> si une transaction est ouverte, puis on signale l'erreur (<code>THROW;</code> la relance, <code>ERROR_MESSAGE()</code> donne son texte).</li>
</ul>
<p>Ce trio <code>XACT_ABORT</code> + <code>TRY/CATCH</code> + <code>ROLLBACK</code> est le modèle à recopier pour tout script qui écrit plusieurs fois.</p>

<h3>Les verrous et la concurrence</h3>
<p>Pendant une transaction, SQL Server pose des <strong>verrous</strong> sur les lignes modifiées. Une autre session qui veut les lire attend la fin de la transaction. C'est ce qui protège les données, mais aussi ce qui rend une transaction longue dangereuse : tout le monde attend derrière.</p>
<p>Pour le stock, le piège classique est « lire, puis écrire » : deux clients lisent « il reste 1 écran », les deux passent commande. La parade la plus simple : vérifier et modifier dans <strong>la même instruction</strong>, <code>UPDATE … SET Stock = Stock - 1 WHERE Id = 3 AND Stock &gt;= 1</code>, puis regarder <code>@@ROWCOUNT</code> (le nombre de lignes touchées).</p>

<h3>Les niveaux d'isolation</h3>
<p>Le <strong>niveau d'isolation</strong> règle ce qu'une transaction voit du travail des autres. Plus il est strict, moins il y a d'anomalies, mais plus il y a d'attente.</p>
<table>
<tr><th>Niveau</th><th>Lecture sale</th><th>Lecture non répétable</th><th>Lignes fantômes</th></tr>
<tr><td><code>READ UNCOMMITTED</code></td><td>Possible</td><td>Possible</td><td>Possible</td></tr>
<tr><td><code>READ COMMITTED</code> (défaut)</td><td>Non</td><td>Possible</td><td>Possible</td></tr>
<tr><td><code>REPEATABLE READ</code></td><td>Non</td><td>Non</td><td>Possible</td></tr>
<tr><td><code>SERIALIZABLE</code></td><td>Non</td><td>Non</td><td>Non</td></tr>
<tr><td><code>SNAPSHOT</code></td><td>Non</td><td>Non</td><td>Non</td></tr>
</table>
<p>Une <strong>lecture sale</strong> lit une donnée pas encore validée (qui sera peut-être annulée). Une <strong>lecture non répétable</strong> : relire la même ligne dans la transaction donne une autre valeur. Une <strong>ligne fantôme</strong> : relire la même requête fait apparaître une nouvelle ligne.</p>
<pre class="diagram">
 Session A                  Session B
 BEGIN TRAN
 UPDATE Stock = 999
                            SELECT Stock ...
                            READ COMMITTED :
                              attend A
                            READ UNCOMMITTED :
                              lit 999 (sale)
 ROLLBACK
                            le 999 n'a jamais
                            existé
</pre>
<p>On change de niveau pour la session avec <code>SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;</code>. <code>SNAPSHOT</code> lit une photo des données prise au début de la transaction, sans attendre les verrous ; il doit d'abord être autorisé sur la base (<code>ALTER DATABASE … SET ALLOW_SNAPSHOT_ISOLATION ON</code>).</p>
<div class="note">Garde <code>READ COMMITTED</code> par défaut et des transactions <strong>courtes</strong> : jamais d'attente d'une saisie utilisateur ni d'appel HTTP au milieu. Beaucoup d'équipes activent <code>READ_COMMITTED_SNAPSHOT</code> sur la base : les lecteurs lisent la dernière version validée au lieu d'attendre les écrivains, ce qui supprime la plupart des blocages. Et méfie-toi de <code>WITH (NOLOCK)</code> : c'est du READ UNCOMMITTED déguisé.</div>`,
  examples: [
    {
      title: "ROLLBACK : annuler une erreur",
      code: `BEGIN TRANSACTION;

UPDATE Products SET Price = 1 WHERE Id = 3;  -- oups, faute de frappe
SELECT Name, Price FROM Products WHERE Id = 3; -- dans la transaction

ROLLBACK;  -- on annule tout ce qui a été fait depuis BEGIN

SELECT Name, Price FROM Products WHERE Id = 3; -- après l'annulation`,
      output: `(1 rows affected)
Name            | Price
----------------+------
Écran 27 pouces | 1.00

(1 rows affected)
Name            | Price
----------------+-------
Écran 27 pouces | 279.00

(1 rows affected)`,
      steps: [
        "<code>BEGIN TRANSACTION;</code> : à partir d'ici, rien n'est définitif.",
        "<code>UPDATE Products SET Price = 1 WHERE Id = 3;</code> : la modification est faite, « (1 rows affected) ».",
        "<code>SELECT … WHERE Id = 3;</code> : <em>dans</em> la transaction, on voit déjà le nouveau prix 1.00. Les autres sessions, elles, attendraient.",
        "<code>ROLLBACK;</code> : tout est annulé, le verrou est libéré.",
        "<code>Écran 27 pouces | 279.00</code> : le prix d'origine est revenu, comme si rien ne s'était passé."
      ],
      explain: "Bonne habitude quand tu modifies des données à la main : BEGIN TRANSACTION, ta modification, un SELECT pour vérifier, puis COMMIT ou ROLLBACK."
    },
    {
      title: "Une commande tout ou rien",
      code: `SET NOCOUNT ON;
SET XACT_ABORT ON; -- toute erreur annule la transaction

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO Orders (CustomerId, Status) VALUES (4, 'Pending');
    DECLARE @OrderId INT = SCOPE_IDENTITY();

    -- 30 webcams, au prix actuel du catalogue
    INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice)
    SELECT @OrderId, Id, 30, Price FROM Products WHERE Id = 6;

    -- Stock 15 - 30 = -15 : la contrainte CK_Products_Stock refuse
    UPDATE Products SET Stock = Stock - 30 WHERE Id = 6;

    COMMIT;
    PRINT N'Commande créée';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    PRINT N'Annulée : ' + ERROR_MESSAGE();
END CATCH;

SELECT (SELECT COUNT(*) FROM Orders)     AS Orders,
       (SELECT COUNT(*) FROM OrderLines) AS OrderLines,
       (SELECT Stock FROM Products WHERE Id = 6) AS WebcamStock;`,
      output: `Annulée : The UPDATE statement conflicted with the CHECK constraint "CK_Products_Stock". The conflict occurred in database "OrderFlow", table "dbo.Products", column 'Stock'.
Orders | OrderLines | WebcamStock
-------+------------+------------
5      | 8          | 15`,
      steps: [
        "<code>SET XACT_ABORT ON;</code> : la moindre erreur condamne toute la transaction.",
        "<code>DECLARE @OrderId INT = SCOPE_IDENTITY();</code> : une variable T-SQL (préfixe <code>@</code>) qui reçoit l'Id que l'INSERT vient de générer.",
        "<code>INSERT INTO OrderLines … SELECT @OrderId, Id, 30, Price FROM Products WHERE Id = 6;</code> : un INSERT alimenté par un SELECT, pour recopier le prix du catalogue.",
        "<code>UPDATE Products SET Stock = Stock - 30 …</code> : le stock deviendrait -15, la contrainte refuse et on saute dans le <code>CATCH</code>.",
        "<code>IF @@TRANCOUNT &gt; 0 ROLLBACK;</code> : on annule la commande et la ligne déjà insérées.",
        "<code>PRINT N'Annulée : ' + ERROR_MESSAGE();</code> : affiche le message d'erreur d'origine.",
        "<code>5 | 8 | 15</code> : toujours 5 commandes, 8 lignes et 15 webcams. Rien n'est resté à moitié fait."
      ],
      explain: "Dans une vraie application, on écrirait THROW; à la place du PRINT pour que l'erreur remonte jusqu'au code C#, qui fera le ROLLBACK de son côté avec SqlTransaction."
    },
    {
      title: "Réserver du stock sans survente",
      code: `SET NOCOUNT ON;
DECLARE @ProductId INT = 1, @Quantity INT = 20;

-- Vérifier ET retirer le stock dans une seule instruction :
-- personne ne peut se glisser entre les deux
UPDATE Products
SET Stock = Stock - @Quantity
WHERE Id = @ProductId AND Stock >= @Quantity;

IF @@ROWCOUNT = 0
    PRINT N'Stock insuffisant';
ELSE
    PRINT N'Stock réservé';

-- Deuxième essai : il ne reste que 5 claviers
UPDATE Products
SET Stock = Stock - @Quantity
WHERE Id = @ProductId AND Stock >= @Quantity;

IF @@ROWCOUNT = 0
    PRINT N'Stock insuffisant';
ELSE
    PRINT N'Stock réservé';

SELECT Name, Stock FROM Products WHERE Id = @ProductId;`,
      output: `Stock réservé
Stock insuffisant
Name              | Stock
------------------+------
Clavier mécanique | 5`,
      steps: [
        "<code>DECLARE @ProductId INT = 1, @Quantity INT = 20;</code> : deux variables, comme les futurs paramètres de ta requête C#.",
        "<code>WHERE Id = @ProductId AND Stock &gt;= @Quantity</code> : la vérification fait partie de la mise à jour. SQL Server verrouille la ligne pendant l'instruction : deux sessions ne peuvent pas retirer le même stock en même temps.",
        "<code>IF @@ROWCOUNT = 0</code> : <code>@@ROWCOUNT</code> donne le nombre de lignes touchées par l'instruction précédente. 0 veut dire « condition fausse ».",
        "<code>PRINT N'Stock réservé';</code> : premier essai, 25 ≥ 20, le stock passe à 5.",
        "<code>PRINT N'Stock insuffisant';</code> : deuxième essai, 5 ≥ 20 est faux, aucune ligne n'est modifiée."
      ],
      explain: "Comparé à « SELECT le stock, puis UPDATE si suffisant », ce modèle n'a pas de trou entre la lecture et l'écriture, quel que soit le niveau d'isolation."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Quel est mon niveau d'isolation ?",
      prompt: `<p>Écris une requête qui affiche en toutes lettres le niveau d'isolation de ta session. La vue <code>sys.dm_exec_sessions</code> contient une colonne <code>transaction_isolation_level</code> (1 = READ UNCOMMITTED, 2 = READ COMMITTED, 3 = REPEATABLE READ, 4 = SERIALIZABLE, 5 = SNAPSHOT) ; ta session a pour numéro <code>@@SPID</code>.</p>`,
      hint: `<p>Utilise <code>CASE … WHEN 1 THEN 'READ UNCOMMITTED' … END</code> pour traduire le nombre en texte.</p>`,
      solution: `SELECT CASE transaction_isolation_level
           WHEN 1 THEN 'READ UNCOMMITTED'
           WHEN 2 THEN 'READ COMMITTED'
           WHEN 3 THEN 'REPEATABLE READ'
           WHEN 4 THEN 'SERIALIZABLE'
           WHEN 5 THEN 'SNAPSHOT'
       END AS IsolationLevel
FROM sys.dm_exec_sessions
WHERE session_id = @@SPID;
-- READ COMMITTED (le défaut)`
    },
    {
      level: "moyen",
      title: "Expédier une commande payée",
      prompt: `<p>Écris un script qui passe la commande <code>@OrderId</code> au statut <code>Shipped</code>, <strong>seulement</strong> si elle est au statut <code>Paid</code>. Sinon, la transaction est annulée et le script affiche « Refusé : » suivi d'un message clair. Teste avec la commande 1 (payée), puis avec la commande 2 (en attente).</p>`,
      hint: `<p>Mets la condition dans le <code>WHERE</code> de l'UPDATE, puis teste <code>@@ROWCOUNT</code>. <code>THROW 50001, N'…', 1;</code> lève ta propre erreur et envoie dans le <code>CATCH</code>. Dans un texte, une apostrophe se double : <code>n''est</code>.</p>`,
      solution: `SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @OrderId INT = 1;   -- puis 2

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE Orders SET Status = 'Shipped'
    WHERE Id = @OrderId AND Status = 'Paid';

    IF @@ROWCOUNT = 0
        THROW 50001, N'La commande n''est pas au statut Paid', 1;

    COMMIT;
    PRINT N'Commande expédiée';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    PRINT N'Refusé : ' + ERROR_MESSAGE();
END CATCH;
-- Commande 1 : « Commande expédiée »
-- Commande 2 : « Refusé : La commande n'est pas au statut Paid »`
    },
    {
      level: "difficile",
      title: "Observer une lecture sale",
      prompt: `<p>Ouvre <strong>deux</strong> fenêtres de requête (deux sessions) sur OrderFlow. Dans la session A, ouvre une transaction qui met le stock de la souris (Id 2) à 999, <strong>sans</strong> la valider. Dans la session B, lis ce stock en <code>READ COMMITTED</code> : que se passe-t-il ? Annule la lecture, passe en <code>READ UNCOMMITTED</code> et relis. Termine par un <code>ROLLBACK</code> dans A et explique ce que B a vu.</p>`,
      hint: `<p>Dans B, la première lecture reste bloquée : arrête-la avec le bouton « Annuler » de ton outil (ou <kbd>Ctrl</kbd>+<kbd>C</kbd> dans sqlcmd). <code>SET LOCK_TIMEOUT 3000;</code> la fait échouer au bout de 3 secondes au lieu d'attendre.</p>`,
      solution: `-- ===== Session A =====
BEGIN TRANSACTION;
UPDATE Products SET Stock = 999 WHERE Id = 2;
-- ne pas valider tout de suite

-- ===== Session B =====
SET LOCK_TIMEOUT 3000;      -- abandonne après 3 secondes
SELECT Stock FROM Products WHERE Id = 2;
-- READ COMMITTED : la lecture attend le verrou de A,
-- puis échoue avec l'erreur 1222 « Lock request time out period exceeded »

SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT Stock FROM Products WHERE Id = 2;
-- READ UNCOMMITTED : renvoie 999 tout de suite (lecture sale)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- on revient au défaut

-- ===== Session A =====
ROLLBACK;
-- Le stock revient à 80 : B a lu une valeur 999 qui n'a jamais été validée.`
    }
  ],
  quiz: [
    {
      q: `Sans <code>SET XACT_ABORT ON</code> ni TRY/CATCH, une contrainte violée au milieu d'une transaction…`,
      options: ["annule toute la transaction", "n'annule que l'instruction fautive, et un COMMIT validerait le reste", "arrête le serveur"],
      answer: 1,
      why: `Par défaut, beaucoup d'erreurs n'annulent que l'instruction en cause. C'est pourquoi on combine <code>XACT_ABORT ON</code> et <code>TRY/CATCH</code> avec un <code>ROLLBACK</code> explicite.`
    },
    {
      q: `Quel est le niveau d'isolation par défaut de SQL Server ?`,
      options: ["<code>READ UNCOMMITTED</code>", "<code>SERIALIZABLE</code>", "<code>READ COMMITTED</code>"],
      answer: 2,
      why: `<code>READ COMMITTED</code> empêche les lectures sales : on ne lit que des données validées. Les lectures non répétables et les fantômes restent possibles.`
    },
    {
      q: `Qu'est-ce qu'une <strong>lecture sale</strong> ?`,
      options: ["Lire une donnée modifiée par une transaction pas encore validée", "Lire une table sans index", "Lire deux fois la même ligne"],
      answer: 0,
      why: `La transaction qui a écrit peut encore faire un ROLLBACK : la valeur lue n'aura peut-être jamais existé. Seul <code>READ UNCOMMITTED</code> (ou <code>NOLOCK</code>) l'autorise.`
    },
    {
      q: `Pourquoi écrire <code>UPDATE … SET Stock = Stock - 1 WHERE Id = 3 AND Stock &gt;= 1</code> plutôt que SELECT puis UPDATE ?`,
      options: ["C'est plus court à écrire", "La vérification et l'écriture se font en une instruction : aucune autre session ne peut s'intercaler", "Ça évite d'avoir besoin d'un index"],
      answer: 1,
      why: `Entre un SELECT et un UPDATE séparés, une autre session peut prendre le dernier exemplaire. En une seule instruction, la ligne est verrouillée pendant la vérification et la modification.`
    }
  ],
  project: `<p><strong>OrderFlow : passer une commande pour de vrai.</strong> Reprends <code>database/12-place-order.sql</code> et transforme-le en <code>database/20-place-order.sql</code> : <code>SET XACT_ABORT ON</code>, <code>TRY/CATCH</code>, une transaction, et une réservation de stock conditionnelle (<code>WHERE Stock &gt;= @Quantity</code> + <code>@@ROWCOUNT</code>) qui lève <code>THROW 50001</code> avec le nom du produit si le stock manque. Teste un cas qui passe et un cas qui échoue, et vérifie qu'après l'échec aucune ligne n'a été ajoutée. Au chapitre ADO.NET, tu traduiras ce script en C# avec <code>SqlTransaction</code>.</p>`,
  resources: [
    { label: "Transactions (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/language-elements/transactions-transact-sql" },
    { label: "SET TRANSACTION ISOLATION LEVEL (Transact-SQL)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/statements/set-transaction-isolation-level-transact-sql" }
  ]
});
