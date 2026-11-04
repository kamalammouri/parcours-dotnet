window.COURSE = window.COURSE || [];

// ───────────────────────── Jour 21 : SQL Server pour développeurs ─────────────────────────
window.COURSE.push({
  key: "a-sql",
  title: "SQL Server pour développeurs",
  summary: "Installer SQL Server, créer la base OrderFlow avec ses clés, contraintes et index, et écrire les requêtes qu'une API exécute tous les jours.",
  objectives: [
    "Installer SQL Server en local (Docker ou LocalDB) et s'y connecter avec un outil graphique",
    "Choisir le bon type de colonne et poser clés primaires, étrangères et contraintes",
    "Comprendre index clustered, non clustered et couvrant, et quand en créer",
    "Écrire SELECT, JOIN, GROUP BY, pagination, INSERT/UPDATE/DELETE avec OUTPUT",
    "Encadrer plusieurs écritures dans une transaction et lire un plan d'exécution simple"
  ],
  lesson: `
<h3>Pourquoi un développeur d'API doit parler SQL</h3>
<p>EF Core, Dapper et ADO.NET finissent tous par envoyer du SQL à la base. Quand une API est lente, la cause se trouve neuf fois sur dix dans la requête générée, un index manquant ou un verrou. Un développeur senior lit le SQL produit par son ORM, sait dire s'il est raisonnable et sait l'écrire à la main quand l'ORM ne suffit pas. Ce module commence donc par SQL Server lui-même, avant d'écrire la moindre ligne de C#.</p>

<h3>Installer SQL Server</h3>
<table>
<thead><tr><th>Option</th><th>Pour qui</th><th>Remarques</th></tr></thead>
<tbody>
<tr><td>Docker <code>mcr.microsoft.com/mssql/server:2022-latest</code></td><td>Windows, macOS, Linux</td><td>Le plus proche de la production, se supprime en une commande. Sur Mac Apple Silicon, active l'émulation Rosetta dans Docker Desktop.</td></tr>
<tr><td>SQL Server Express</td><td>Windows</td><td>Gratuit, installé comme un service Windows, limité à 10 Go par base.</td></tr>
<tr><td>LocalDB <code>(localdb)\\MSSQLLocalDB</code></td><td>Windows avec Visual Studio</td><td>Démarre à la demande, idéal pour les tests rapides, pas pour plusieurs applications à la fois.</td></tr>
</tbody>
</table>
<p>Avec Docker, une seule commande suffit :</p>
<pre><code>docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=OrderFlow_Dev_2026!" \\
  -p 1433:1433 --name orderflow-sql -d mcr.microsoft.com/mssql/server:2022-latest</code></pre>
<p>Le mot de passe doit respecter la politique de complexité (8 caractères, majuscules, minuscules, chiffres, symboles), sinon le conteneur s'arrête tout seul : vérifie avec <code>docker logs orderflow-sql</code>.</p>

<h3>Les outils</h3>
<ul>
<li><strong>SSMS</strong> (SQL Server Management Studio) : l'outil de référence sous Windows, avec les plans d'exécution graphiques.</li>
<li><strong>Extension mssql de VS Code</strong> : multiplateforme, suffisante pour écrire et exécuter des scripts.</li>
<li><strong>Azure Data Studio</strong> : encore croisé en entreprise, mais Microsoft l'a mis en fin de vie au profit de l'extension VS Code.</li>
</ul>
<p>Connexion : serveur <code>localhost,1433</code> (la virgule sépare le port), authentification SQL avec l'utilisateur <code>sa</code>, et coche « Faire confiance au certificat du serveur » car le conteneur utilise un certificat auto-signé.</p>

<h3>Choisir les types de colonnes</h3>
<table>
<thead><tr><th>Besoin</th><th>Type SQL Server</th><th>Type C#</th><th>Piège</th></tr></thead>
<tbody>
<tr><td>Identifiant auto-incrémenté</td><td><code>INT IDENTITY(1,1)</code></td><td><code>int</code></td><td>Passe à <code>BIGINT</code> au-delà de 2 milliards de lignes.</td></tr>
<tr><td>Texte</td><td><code>NVARCHAR(200)</code></td><td><code>string</code></td><td><code>VARCHAR</code> ne stocke pas tous les caractères Unicode ; <code>NVARCHAR(MAX)</code> ne s'indexe pas.</td></tr>
<tr><td>Montant</td><td><code>DECIMAL(18,2)</code></td><td><code>decimal</code></td><td>Jamais <code>FLOAT</code> pour de l'argent : 0,1 + 0,2 n'y vaut pas 0,3.</td></tr>
<tr><td>Date et heure</td><td><code>DATETIME2</code></td><td><code>DateTime</code></td><td>Stocke en UTC (<code>SYSUTCDATETIME()</code>) ; <code>DATETIME</code> est ancien et moins précis.</td></tr>
<tr><td>Booléen</td><td><code>BIT</code></td><td><code>bool</code></td><td>Pas de <code>true</code>/<code>false</code> en SQL : on écrit 1 et 0.</td></tr>
<tr><td>Identifiant public</td><td><code>UNIQUEIDENTIFIER</code></td><td><code>Guid</code></td><td>Mauvaise clé clustered (insertion aléatoire) ; garde-le en colonne secondaire.</td></tr>
<tr><td>Jeton de concurrence</td><td><code>ROWVERSION</code></td><td><code>byte[]</code></td><td>Mis à jour automatiquement à chaque modification de la ligne.</td></tr>
</tbody>
</table>

<h3>Clés et contraintes</h3>
<p>La <strong>clé primaire</strong> identifie une ligne et crée par défaut l'index clustered. La <strong>clé étrangère</strong> garantit qu'une commande pointe vers un client qui existe : c'est la base, pas ton code C#, qui protège l'intégrité, même si un script manuel ou une autre application écrit dans les tables. Ajoute aussi :</p>
<ul>
<li><code>UNIQUE</code> pour un email ou un SKU : impossible d'avoir deux clients avec la même adresse, même avec deux requêtes simultanées.</li>
<li><code>CHECK</code> pour une règle simple : prix positif, quantité supérieure à zéro, statut dans une liste.</li>
<li><code>DEFAULT</code> pour une valeur automatique : date de création, <code>IsActive = 1</code>.</li>
</ul>
<p>Nomme tes contraintes (<code>CONSTRAINT UQ_Customers_Email UNIQUE</code>) : le nom apparaît dans les messages d'erreur, et tu le retrouveras dans les exceptions côté C#.</p>

<h3>Les index</h3>
<p>Sans index, SQL Server lit toute la table pour trouver une ligne (un <em>scan</em>). Un index est une structure triée qui permet d'aller directement aux bonnes lignes (un <em>seek</em>).</p>
<ul>
<li><strong>Clustered</strong> : c'est la table elle-même, triée sur la clé. Un seul par table, en général la clé primaire.</li>
<li><strong>Non clustered</strong> : une copie triée de quelques colonnes avec un pointeur vers la ligne. Crée-en sur les colonnes de tes <code>WHERE</code>, <code>JOIN</code> et <code>ORDER BY</code> fréquents, et sur chaque clé étrangère (SQL Server ne le fait pas automatiquement).</li>
<li><strong>Couvrant</strong> : un index non clustered avec <code>INCLUDE (...)</code> qui contient toutes les colonnes dont la requête a besoin. SQL Server répond sans toucher à la table.</li>
</ul>
<p>Chaque index accélère la lecture mais ralentit les écritures et prend de la place : indexe ce que tes requêtes utilisent réellement, pas toutes les colonnes.</p>

<h3>Les requêtes du quotidien</h3>
<p>Une API fait surtout cinq choses : lire une ligne par son id, lister avec filtre, tri et pagination (<code>ORDER BY ... OFFSET n ROWS FETCH NEXT m ROWS ONLY</code>), joindre des tables (<code>INNER JOIN</code> garde seulement les correspondances, <code>LEFT JOIN</code> garde toutes les lignes de gauche), agréger (<code>GROUP BY</code>, puis <code>HAVING</code> pour filtrer sur l'agrégat), et écrire. <code>OUTPUT INSERTED.Id</code> renvoie l'identifiant créé dans la même instruction que l'<code>INSERT</code>, sans seconde requête.</p>
<p>Deux pièges classiques : <code>OFFSET</code> sans <code>ORDER BY</code> est refusé, et un <code>ORDER BY</code> sur une colonne non unique (le nom) donne une pagination instable. Ajoute toujours l'id en dernier critère de tri.</p>

<h3>NULL et la logique à trois valeurs</h3>
<p>En SQL, <code>NULL</code> signifie « valeur inconnue », pas « vide ». Toute comparaison avec <code>NULL</code> donne <em>UNKNOWN</em>, ni vrai ni faux : <code>WHERE Description = NULL</code> ne renvoie jamais rien, il faut écrire <code>WHERE Description IS NULL</code>. De même, <code>WHERE Status &lt;&gt; 'Paid'</code> exclut les lignes où <code>Status</code> est NULL. Les agrégats ignorent les NULL (<code>AVG</code> calcule sur les valeurs connues), et <code>ISNULL(col, 0)</code> ou <code>COALESCE(a, b, c)</code> remplacent une valeur absente. Rends une colonne <code>NOT NULL</code> chaque fois que la valeur est obligatoire : c'est une source de bugs en moins, et côté C# un type non nullable en moins à vérifier.</p>

<h3>Normaliser sans s'égarer</h3>
<p>Une base bien conçue stocke chaque information à un seul endroit. Le nom du client vit dans <code>Customers</code>, pas recopié dans chaque commande ; les lignes de commande sont dans leur propre table au lieu d'une colonne « produits » contenant une liste séparée par des virgules. Trois règles suffisent au quotidien :</p>
<ul>
<li>une colonne contient une seule valeur (pas de liste, pas de JSON fourre-tout pour des données que tu filtres) ;</li>
<li>chaque table a une clé, et chaque colonne dépend de cette clé ;</li>
<li>une information répétée sur plusieurs lignes mérite sa propre table reliée par une clé étrangère.</li>
</ul>
<p>Il existe une exception assumée : <code>OrderLines.UnitPrice</code> recopie le prix au moment de la commande. Ce n'est pas une duplication, c'est un historique : si le prix du produit change demain, la facture d'hier ne doit pas changer. Savoir distinguer les deux fait partie du métier.</p>

<h3>Transactions</h3>
<p>Créer une commande, c'est insérer l'en-tête, les lignes et décrémenter le stock. Si la troisième étape échoue, les deux premières doivent être annulées. <code>BEGIN TRANSACTION</code> ... <code>COMMIT</code> rend l'ensemble atomique, <code>ROLLBACK</code> annule tout. En T-SQL, combine <code>SET XACT_ABORT ON</code> et <code>BEGIN TRY ... END TRY BEGIN CATCH ... END CATCH</code> pour que toute erreur annule la transaction. Les niveaux d'isolation et les procédures stockées sont traités au jour 24.</p>

<h3>Lire un plan d'exécution</h3>
<p>Dans SSMS, <kbd>Ctrl</kbd>+<kbd>M</kbd> active le plan réel, puis exécute la requête. Cherche trois choses : un <em>Table Scan</em> ou <em>Clustered Index Scan</em> sur une grosse table (index manquant), un <em>Key Lookup</em> répété (index non couvrant), et l'écart entre lignes estimées et lignes réelles (statistiques obsolètes). <code>SET STATISTICS IO ON</code> affiche en plus le nombre de pages lues : c'est la mesure la plus fiable pour comparer deux versions d'une requête.</p>

<div class="note">Toute règle qui doit être vraie quoi qu'il arrive (unicité, référence, valeur positive) va dans la base sous forme de contrainte, en plus de la validation côté API. La validation C# donne un joli message d'erreur ; la contrainte garantit l'intégrité quand deux requêtes arrivent en même temps, qu'un script de migration passe ou qu'une autre application écrit dans les tables. Et avant de mettre une requête en production, regarde son plan d'exécution sur un volume réaliste, pas sur dix lignes de test.</div>
`,
  examples: [
    {
      title: "Script complet de la base OrderFlow",
      code: `-- Crée la base OrderFlow avec ses tables, contraintes, index et données de test
IF DB_ID('OrderFlow') IS NULL CREATE DATABASE OrderFlow;
GO
USE OrderFlow;
GO

CREATE TABLE dbo.Customers (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Customers PRIMARY KEY,
    Email     NVARCHAR(256)     NOT NULL CONSTRAINT UQ_Customers_Email UNIQUE,
    FullName  NVARCHAR(200)     NOT NULL,
    CreatedAt DATETIME2         NOT NULL CONSTRAINT DF_Customers_CreatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Products (
    Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
    Sku         NVARCHAR(32)      NOT NULL CONSTRAINT UQ_Products_Sku UNIQUE,
    Name        NVARCHAR(200)     NOT NULL,
    Description NVARCHAR(MAX)     NULL,
    Price       DECIMAL(18,2)     NOT NULL CONSTRAINT CK_Products_Price CHECK (Price >= 0),
    Stock       INT               NOT NULL CONSTRAINT CK_Products_Stock CHECK (Stock >= 0),
    IsActive    BIT               NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
    RowVersion  ROWVERSION        NOT NULL
);

CREATE TABLE dbo.Orders (
    Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
    PublicId   UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_Orders_PublicId DEFAULT NEWID()
                                          CONSTRAINT UQ_Orders_PublicId UNIQUE,
    CustomerId INT               NOT NULL CONSTRAINT FK_Orders_Customers REFERENCES dbo.Customers(Id),
    Status     NVARCHAR(20)      NOT NULL CONSTRAINT DF_Orders_Status DEFAULT 'Pending'
                                          CONSTRAINT CK_Orders_Status CHECK (Status IN ('Pending','Paid','Shipped','Cancelled')),
    Total      DECIMAL(18,2)     NOT NULL CONSTRAINT DF_Orders_Total DEFAULT 0,
    CreatedAt  DATETIME2         NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.OrderLines (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderLines PRIMARY KEY,
    OrderId   INT               NOT NULL CONSTRAINT FK_OrderLines_Orders REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    ProductId INT               NOT NULL CONSTRAINT FK_OrderLines_Products REFERENCES dbo.Products(Id),
    Quantity  INT               NOT NULL CONSTRAINT CK_OrderLines_Quantity CHECK (Quantity > 0),
    UnitPrice DECIMAL(18,2)     NOT NULL
);

-- Index sur les clés étrangères (SQL Server ne les crée pas tout seul)
CREATE INDEX IX_Orders_CustomerId ON dbo.Orders(CustomerId);
CREATE INDEX IX_OrderLines_OrderId ON dbo.OrderLines(OrderId);
CREATE INDEX IX_OrderLines_ProductId ON dbo.OrderLines(ProductId);
-- Index couvrant pour la liste des produits actifs triés par nom
CREATE INDEX IX_Products_IsActive_Name ON dbo.Products(IsActive, Name) INCLUDE (Price, Stock);
GO

-- Données de test
INSERT INTO dbo.Customers (Email, FullName) VALUES
 ('alice@example.com', 'Alice Martin'),
 ('bob@example.com',   'Bob Durand'),
 ('chloe@example.com', 'Chloé Bernard');

INSERT INTO dbo.Products (Sku, Name, Description, Price, Stock) VALUES
 ('KB-001', 'Clavier mécanique', 'Switches rouges, rétroéclairé', 89.90, 25),
 ('MS-002', 'Souris sans fil', NULL, 39.50, 80),
 ('SC-003', 'Écran 27 pouces', '2560x1440, 144 Hz', 279.00, 10),
 ('HD-004', 'Casque audio', 'Réduction de bruit active', 149.00, 0),
 ('CB-005', 'Câble USB-C', NULL, 9.99, 300);

INSERT INTO dbo.Orders (CustomerId, Status, Total) VALUES (1, 'Paid', 129.40), (1, 'Pending', 279.00), (2, 'Shipped', 19.98);
INSERT INTO dbo.OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES
 (1, 1, 1, 89.90), (1, 2, 1, 39.50),
 (2, 3, 1, 279.00),
 (3, 5, 2, 9.99);`,
      explain: "Toutes les contraintes sont nommées : en cas de violation, le message cite <code>UQ_Customers_Email</code> ou <code>CK_Products_Stock</code>, ce qui rend le diagnostic immédiat. Le <code>GO</code> sépare les lots dans SSMS et VS Code ; ce n'est pas du T-SQL, il ne passe pas dans une commande ADO.NET."
    },
    {
      title: "Lire : filtre, jointures, agrégats et pagination",
      code: `USE OrderFlow;

-- Produits actifs en stock, page 1 (10 par page), tri stable
SELECT Id, Sku, Name, Price, Stock
FROM dbo.Products
WHERE IsActive = 1 AND Stock > 0
ORDER BY Name, Id
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

-- Commandes avec le nom du client (INNER JOIN : seulement les correspondances)
SELECT o.Id, o.Status, o.Total, c.FullName
FROM dbo.Orders AS o
INNER JOIN dbo.Customers AS c ON c.Id = o.CustomerId
ORDER BY o.CreatedAt DESC;

-- Tous les clients et leur nombre de commandes, y compris ceux qui n'en ont pas (LEFT JOIN)
SELECT c.FullName, COUNT(o.Id) AS OrderCount, ISNULL(SUM(o.Total), 0) AS TotalSpent
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o ON o.CustomerId = c.Id
GROUP BY c.Id, c.FullName
ORDER BY TotalSpent DESC;

-- Produits vendus à au moins 2 exemplaires (HAVING filtre après l'agrégat)
SELECT p.Name, SUM(l.Quantity) AS Sold
FROM dbo.OrderLines AS l
INNER JOIN dbo.Products AS p ON p.Id = l.ProductId
GROUP BY p.Id, p.Name
HAVING SUM(l.Quantity) >= 2;`,
      explain: "<code>COUNT(o.Id)</code> et non <code>COUNT(*)</code> dans le <code>LEFT JOIN</code> : <code>COUNT(*)</code> compterait 1 pour un client sans commande, car la ligne existe avec des colonnes NULL."
    },
    {
      title: "Écrire : INSERT avec OUTPUT, UPDATE, DELETE",
      code: `USE OrderFlow;

-- Récupérer l'id généré dans la même instruction
INSERT INTO dbo.Products (Sku, Name, Price, Stock)
OUTPUT INSERTED.Id, INSERTED.RowVersion
VALUES ('WC-006', 'Webcam HD', 59.90, 40);

-- Augmenter de 5 % les prix des produits actifs sous 50 euros, et voir l'avant/après
UPDATE dbo.Products
SET Price = ROUND(Price * 1.05, 2)
OUTPUT DELETED.Price AS OldPrice, INSERTED.Price AS NewPrice, INSERTED.Name
WHERE IsActive = 1 AND Price < 50;

-- Suppression logique plutôt que physique : le produit reste lié aux anciennes commandes
UPDATE dbo.Products SET IsActive = 0 WHERE Sku = 'HD-004';

-- Suppression physique : échoue si une ligne de commande référence le produit (FK)
DELETE FROM dbo.Products WHERE Sku = 'WC-006';`,
      explain: "Dans un <code>UPDATE</code>, <code>DELETED</code> contient les valeurs avant modification et <code>INSERTED</code> les valeurs après. Toujours tester le <code>WHERE</code> avec un <code>SELECT</code> avant de lancer un <code>UPDATE</code> ou un <code>DELETE</code>."
    },
    {
      title: "Transaction : créer une commande sans survente",
      code: `USE OrderFlow;
SET XACT_ABORT ON; -- toute erreur annule la transaction

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @OrderId INT;
    INSERT INTO dbo.Orders (CustomerId) VALUES (2);
    SET @OrderId = SCOPE_IDENTITY();

    INSERT INTO dbo.OrderLines (OrderId, ProductId, Quantity, UnitPrice)
    SELECT @OrderId, Id, 3, Price FROM dbo.Products WHERE Id = 1;

    -- Le CHECK (Stock >= 0) refuse la mise à jour si le stock est insuffisant
    UPDATE dbo.Products SET Stock = Stock - 3 WHERE Id = 1;

    UPDATE dbo.Orders
    SET Total = (SELECT SUM(Quantity * UnitPrice) FROM dbo.OrderLines WHERE OrderId = @OrderId)
    WHERE Id = @OrderId;

    COMMIT;
    SELECT @OrderId AS CreatedOrderId;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW; -- relance l'erreur d'origine vers l'appelant
END CATCH;`,
      explain: "La contrainte <code>CK_Products_Stock</code> fait le travail de vérification : si deux commandes simultanées veulent le dernier exemplaire, la seconde échoue et sa transaction est annulée en entier."
    },
    {
      title: "Mesurer l'effet d'un index",
      code: `USE OrderFlow;
SET STATISTICS IO ON;  -- affiche les pages lues dans l'onglet Messages

-- Sans index sur Email ce serait un scan ; ici la contrainte UNIQUE a créé un index
SELECT Id, FullName FROM dbo.Customers WHERE Email = 'bob@example.com';

-- Recherche par statut : pas d'index → scan de la table Orders
SELECT Id, Total FROM dbo.Orders WHERE Status = 'Pending';

-- Index couvrant : le filtre en clé, les colonnes lues en INCLUDE
CREATE INDEX IX_Orders_Status ON dbo.Orders(Status) INCLUDE (Total);

-- Relance la même requête : le plan passe en Index Seek et les lectures baissent
SELECT Id, Total FROM dbo.Orders WHERE Status = 'Pending';

SET STATISTICS IO OFF;`,
      explain: "Sur quelques lignes la différence est invisible. Pour la voir, insère 100 000 commandes (par exemple avec une boucle <code>WHILE</code>) puis compare les « logical reads » avant et après l'index."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Catalogue paginé",
      prompt: "<p>Écris la requête qui renvoie la <strong>page 2</strong> (5 produits par page) des produits actifs dont le prix est supérieur à 20 euros, triés du plus cher au moins cher. Colonnes : <code>Sku</code>, <code>Name</code>, <code>Price</code>.</p>",
      hint: "<p>Page 2 de 5 éléments = sauter 5 lignes. Ajoute <code>Id</code> au tri pour une pagination stable entre deux produits au même prix.</p>",
      solution: `SELECT Sku, Name, Price
FROM dbo.Products
WHERE IsActive = 1 AND Price > 20
ORDER BY Price DESC, Id
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;

-- Formule générale : OFFSET (page - 1) * pageSize ROWS FETCH NEXT pageSize ROWS ONLY`
    },
    {
      level: "moyen",
      title: "Chiffre d'affaires par client",
      prompt: "<p>Liste <strong>tous</strong> les clients avec : nom, nombre de commandes payées ou expédiées, chiffre d'affaires correspondant (0 si aucune) et date de la dernière commande (NULL si aucune). Ne garde que les clients dont le chiffre d'affaires est inférieur à 500 euros. Trie par chiffre d'affaires décroissant.</p>",
      hint: "<p>Le filtre sur le statut doit aller dans la condition du <code>LEFT JOIN</code>, pas dans le <code>WHERE</code>, sinon les clients sans commande disparaissent. Le filtre sur le total va dans <code>HAVING</code>.</p>",
      solution: `SELECT c.FullName,
       COUNT(o.Id)              AS PaidOrders,
       ISNULL(SUM(o.Total), 0)  AS Revenue,
       MAX(o.CreatedAt)         AS LastOrderAt
FROM dbo.Customers AS c
LEFT JOIN dbo.Orders AS o
       ON o.CustomerId = c.Id
      AND o.Status IN ('Paid', 'Shipped')   -- dans le ON pour garder les clients sans commande
GROUP BY c.Id, c.FullName
HAVING ISNULL(SUM(o.Total), 0) < 500
ORDER BY Revenue DESC;`
    },
    {
      level: "difficile",
      title: "Commande atomique avec message d'erreur métier",
      prompt: "<p>Écris un script qui crée une commande pour le client 3 contenant 2 claviers (Id 1) et 1 écran (Id 3). Exigences :</p><ul><li>tout ou rien : en cas d'erreur, aucune ligne ne reste en base ;</li><li>si un produit n'a pas assez de stock, lever une erreur lisible <em>« Stock insuffisant pour le produit X »</em> (numéro 50001) au lieu de l'erreur de contrainte ;</li><li>le total de la commande est calculé à partir des prix en base, pas saisi à la main.</li></ul>",
      hint: "<p>Mets les lignes voulues dans une variable table <code>DECLARE @Lines TABLE (ProductId INT, Quantity INT)</code>. Vérifie le stock avec un <code>SELECT TOP 1 ... WHERE p.Stock &lt; l.Quantity</code> et utilise <code>THROW 50001, @msg, 1</code>. Ajoute <code>WITH (UPDLOCK, HOLDLOCK)</code> pour verrouiller les lignes lues jusqu'à la fin de la transaction.</p>",
      solution: `USE OrderFlow;
SET XACT_ABORT ON;

DECLARE @CustomerId INT = 3;
DECLARE @Lines TABLE (ProductId INT PRIMARY KEY, Quantity INT NOT NULL);
INSERT INTO @Lines VALUES (1, 2), (3, 1);

BEGIN TRY
    BEGIN TRANSACTION;

    -- Verrouille les produits concernés pour éviter qu'une autre commande les modifie entre-temps
    DECLARE @Missing NVARCHAR(200);
    SELECT TOP 1 @Missing = p.Name
    FROM dbo.Products AS p WITH (UPDLOCK, HOLDLOCK)
    INNER JOIN @Lines AS l ON l.ProductId = p.Id
    WHERE p.Stock < l.Quantity OR p.IsActive = 0;

    IF @Missing IS NOT NULL
    BEGIN
        DECLARE @Msg NVARCHAR(300) = CONCAT('Stock insuffisant pour le produit ', @Missing);
        THROW 50001, @Msg, 1;
    END;

    DECLARE @OrderId INT;
    INSERT INTO dbo.Orders (CustomerId) VALUES (@CustomerId);
    SET @OrderId = SCOPE_IDENTITY();

    INSERT INTO dbo.OrderLines (OrderId, ProductId, Quantity, UnitPrice)
    SELECT @OrderId, p.Id, l.Quantity, p.Price
    FROM @Lines AS l
    INNER JOIN dbo.Products AS p ON p.Id = l.ProductId;

    UPDATE p SET p.Stock = p.Stock - l.Quantity
    FROM dbo.Products AS p
    INNER JOIN @Lines AS l ON l.ProductId = p.Id;

    UPDATE dbo.Orders
    SET Total = (SELECT SUM(Quantity * UnitPrice) FROM dbo.OrderLines WHERE OrderId = @OrderId)
    WHERE Id = @OrderId;

    COMMIT;
    SELECT @OrderId AS CreatedOrderId;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;`
    }
  ],
  project: "<p><strong>Créer la base OrderFlow.</strong> Lance SQL Server (Docker ou LocalDB), exécute le script complet du premier exemple et vérifie avec <code>SELECT COUNT(*)</code> que chaque table contient ses données de test. Enregistre le script dans ton dépôt sous <code>database/01-schema.sql</code> : il servira de référence pour ADO.NET (jours 22 à 26), puis tu compareras avec le schéma généré par les migrations EF Core.</p><p>Bonus : ajoute 10 000 produits de test avec une boucle <code>WHILE</code> et mesure une recherche par nom avec et sans index.</p>",
  resources: [
    { label: "Démarrage rapide : SQL Server dans un conteneur Docker", url: "https://learn.microsoft.com/sql/linux/quickstart-install-connect-docker" },
    { label: "Types de données (Transact-SQL)", url: "https://learn.microsoft.com/sql/t-sql/data-types/data-types-transact-sql" },
    { label: "Index clustered et non clustered", url: "https://learn.microsoft.com/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described" },
    { label: "Clause OUTPUT (Transact-SQL)", url: "https://learn.microsoft.com/sql/t-sql/queries/output-clause-transact-sql" }
  ]
});

// ───────────────────────── Jour 22 : ADO.NET, connexions et commandes ─────────────────────────
window.COURSE.push({
  key: "a-connect",
  title: "ADO.NET : connexions et commandes",
  summary: "Comprendre la couche d'accès aux données sur laquelle reposent EF Core et Dapper : providers, chaînes de connexion, pool de connexions, commandes et erreurs SQL.",
  objectives: [
    "Situer ADO.NET par rapport à Dapper et EF Core",
    "Écrire et sécuriser une chaîne de connexion SQL Server",
    "Ouvrir et fermer une connexion correctement et comprendre le pool",
    "Choisir entre ExecuteNonQuery, ExecuteScalar et ExecuteReader en async",
    "Traiter les SqlException selon leur numéro"
  ],
  lesson: `
<h3>ADO.NET, la couche du dessous</h3>
<p>ADO.NET est l'API historique d'accès aux données de .NET, présente depuis 2002 et toujours au cœur de la plateforme. EF Core et Dapper ne remplacent pas ADO.NET : ils sont construits dessus. Quand EF Core exécute une requête, il crée une <code>DbCommand</code>, l'exécute sur une <code>DbConnection</code> et lit un <code>DbDataReader</code>. Comprendre ADO.NET, c'est comprendre ce qui se passe réellement sous ton ORM.</p>
<table>
<thead><tr><th></th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr></thead>
<tbody>
<tr><td>Tu écris le SQL</td><td>Oui</td><td>Oui</td><td>Non (LINQ), sauf requêtes brutes</td></tr>
<tr><td>Mapping vers des objets</td><td>À la main</td><td>Automatique</td><td>Automatique + suivi des modifications</td></tr>
<tr><td>Performance</td><td>Maximale</td><td>Quasi identique</td><td>Très bonne, un peu de surcoût</td></tr>
<tr><td>Quand l'utiliser</td><td>Code critique, outils, bulk, legacy</td><td>Lecture SQL optimisée</td><td>L'essentiel d'une application métier</td></tr>
</tbody>
</table>

<h3>Les providers</h3>
<p>ADO.NET définit des classes abstraites dans <code>System.Data.Common</code>, et chaque base fournit son implémentation :</p>
<table>
<thead><tr><th>Abstraction</th><th>SQL Server</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><code>DbConnection</code></td><td><code>SqlConnection</code></td><td>Canal vers la base</td></tr>
<tr><td><code>DbCommand</code></td><td><code>SqlCommand</code></td><td>Une instruction SQL et ses paramètres</td></tr>
<tr><td><code>DbParameter</code></td><td><code>SqlParameter</code></td><td>Une valeur passée à la requête</td></tr>
<tr><td><code>DbDataReader</code></td><td><code>SqlDataReader</code></td><td>Lecture des lignes, en avant seulement</td></tr>
<tr><td><code>DbTransaction</code></td><td><code>SqlTransaction</code></td><td>Transaction (jour 24)</td></tr>
</tbody>
</table>
<p>Pour SQL Server, installe le package <strong>Microsoft.Data.SqlClient</strong> (<code>dotnet add package Microsoft.Data.SqlClient</code>). L'ancien <code>System.Data.SqlClient</code> est obsolète : il ne reçoit plus de nouveautés et les nouveaux projets ne doivent pas l'utiliser. Tu le croiseras dans du code .NET Framework ; la migration consiste surtout à changer le <code>using</code>.</p>

<h3>La chaîne de connexion</h3>
<table>
<thead><tr><th>Mot-clé</th><th>Exemple</th><th>Signification</th></tr></thead>
<tbody>
<tr><td><code>Server</code></td><td><code>localhost,1433</code></td><td>Serveur et port (virgule)</td></tr>
<tr><td><code>Database</code></td><td><code>OrderFlow</code></td><td>Base par défaut</td></tr>
<tr><td><code>User Id</code> / <code>Password</code></td><td><code>sa</code> / ...</td><td>Authentification SQL</td></tr>
<tr><td><code>Integrated Security</code></td><td><code>True</code></td><td>Authentification Windows, sans mot de passe dans la chaîne</td></tr>
<tr><td><code>Encrypt</code></td><td><code>True</code></td><td>Chiffrement TLS, activé par défaut depuis Microsoft.Data.SqlClient 4</td></tr>
<tr><td><code>TrustServerCertificate</code></td><td><code>True</code></td><td>Accepte un certificat auto-signé : uniquement en développement</td></tr>
<tr><td><code>Connect Timeout</code></td><td><code>5</code></td><td>Secondes avant d'abandonner l'ouverture (15 par défaut)</td></tr>
<tr><td><code>Application Name</code></td><td><code>OrderFlow.Api</code></td><td>Visible côté serveur, précieux pour diagnostiquer</td></tr>
</tbody>
</table>
<p>L'erreur la plus fréquente au premier lancement est « The certificate chain was issued by an authority that is not trusted » : le conteneur Docker a un certificat auto-signé et le chiffrement est obligatoire. En local, ajoute <code>TrustServerCertificate=True</code> ; en production, installe un vrai certificat.</p>
<p>Ne mets jamais de mot de passe dans le code ni dans un <code>appsettings.json</code> versionné. En développement, utilise les <em>user secrets</em> (<code>dotnet user-secrets set "ConnectionStrings:OrderFlow" "..."</code>), stockés hors du dépôt. En production, des variables d'environnement ou un coffre comme Azure Key Vault. <code>SqlConnectionStringBuilder</code> permet de construire ou modifier une chaîne sans concaténation fragile.</p>

<h3>Ouvrir tard, fermer tôt</h3>
<p>Une <code>SqlConnection</code> est <code>IDisposable</code> : déclare-la avec <code>await using</code>, ouvre-la juste avant d'exécuter, et laisse-la se fermer à la fin du bloc. Ne garde jamais une connexion ouverte dans un champ de classe ou un singleton : elle n'est pas thread-safe et bloquerait une ressource rare.</p>
<p>Ouvrir une connexion physique coûte cher (réseau, authentification, TLS). Le <strong>pool de connexions</strong> s'en charge : quand tu appelles <code>Close</code> ou <code>Dispose</code>, la connexion n'est pas fermée mais rendue au pool, et le prochain <code>OpenAsync</code> avec <strong>exactement la même chaîne de connexion</strong> la réutilise en quelques microsecondes. Il existe un pool par chaîne de connexion, limité à 100 connexions par défaut (<code>Max Pool Size</code>). Conséquences :</p>
<ul>
<li>créer une <code>SqlConnection</code> par opération est la bonne pratique, pas un gaspillage ;</li>
<li>oublier un <code>Dispose</code> fuit une connexion ; au bout de 100, les appels attendent puis lèvent « Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool » ;</li>
<li>une chaîne construite dynamiquement (avec un nom d'utilisateur par requête, par exemple) crée un pool par variante.</li>
</ul>

<h3>Les trois façons d'exécuter une commande</h3>
<table>
<thead><tr><th>Méthode</th><th>Renvoie</th><th>Pour</th></tr></thead>
<tbody>
<tr><td><code>ExecuteNonQueryAsync</code></td><td><code>int</code> : lignes affectées</td><td>INSERT, UPDATE, DELETE, DDL</td></tr>
<tr><td><code>ExecuteScalarAsync</code></td><td><code>object?</code> : première colonne de la première ligne</td><td>COUNT, un id, une valeur unique</td></tr>
<tr><td><code>ExecuteReaderAsync</code></td><td><code>SqlDataReader</code></td><td>Toutes les lectures de lignes</td></tr>
</tbody>
</table>
<p>Dans une API, utilise toujours les variantes <code>Async</code> et passe le <code>CancellationToken</code> de la requête HTTP : si le client se déconnecte, la requête SQL est annulée. <code>ExecuteScalarAsync</code> renvoie <code>null</code> s'il n'y a aucune ligne et <code>DBNull.Value</code> si la valeur est NULL : teste les deux. <code>CommandTimeout</code> (30 secondes par défaut) limite la durée d'exécution, distincte du <code>Connect Timeout</code> de l'ouverture.</p>

<h3>Plusieurs instructions dans une commande</h3>
<p>Une <code>SqlCommand</code> peut contenir plusieurs instructions séparées par des points-virgules : un <code>UPDATE</code> suivi d'un <code>SELECT</code>, par exemple. Elles partent en un seul aller-retour réseau, ce qui compte quand la base est sur un autre serveur (chaque aller-retour coûte souvent 0,5 à 2 ms). En revanche, le séparateur <code>GO</code> des scripts SSMS n'existe pas pour SQL Server : c'est une convention des outils, et une commande ADO.NET qui le contient échoue. Pour exécuter un script avec des <code>GO</code>, découpe-le en lots côté C#.</p>
<p><code>ExecuteNonQueryAsync</code> renvoie la somme des lignes affectées par toutes les instructions. Si un trigger ou un <code>SET NOCOUNT OFF</code> brouille le compte, ajoute <code>SET NOCOUNT ON;</code> en tête du lot : c'est aussi une bonne pratique dans les procédures stockées, car cela évite d'envoyer des messages « n rows affected » inutiles.</p>

<h3>Observer les connexions côté serveur</h3>
<p>Le paramètre <code>Application Name</code> prend tout son sens ici. Cette requête liste les sessions ouvertes par application :</p>
<pre><code>SELECT program_name, COUNT(*) AS Sessions
FROM sys.dm_exec_sessions
WHERE is_user_process = 1
GROUP BY program_name;</code></pre>
<p>Si le nombre de sessions de ton API grimpe sans redescendre, une connexion n'est pas libérée quelque part. Côté client, <code>SqlConnection.ClearAllPools()</code> vide les pools (utile dans les tests après avoir supprimé une base), et les compteurs d'événements <code>Microsoft.Data.SqlClient.EventSource</code> exposent le nombre de connexions actives et en attente, lisibles avec <code>dotnet-counters</code>.</p>

<h3>Les erreurs SQL</h3>
<p>SQL Server signale ses erreurs par une <code>SqlException</code> dont la propriété <code>Number</code> identifie la cause. Traite les cas que tu sais gérer et laisse remonter les autres :</p>
<table>
<thead><tr><th>Number</th><th>Cause</th><th>Réaction habituelle</th></tr></thead>
<tbody>
<tr><td>2627 / 2601</td><td>Violation de contrainte UNIQUE ou de clé primaire</td><td>Réponse 409 Conflict</td></tr>
<tr><td>547</td><td>Violation de clé étrangère ou de CHECK</td><td>Réponse 400 ou 409 selon le cas</td></tr>
<tr><td>1205</td><td>Choisi comme victime d'un deadlock</td><td>Réessayer la transaction</td></tr>
<tr><td>-2</td><td>Timeout de la commande</td><td>Journaliser, analyser la requête</td></tr>
<tr><td>4060 / 18456</td><td>Base introuvable / échec de connexion</td><td>Erreur de configuration</td></tr>
</tbody>
</table>
<p>Le numéro 547 couvre à la fois les clés étrangères et les contraintes CHECK : lis aussi le nom de la contrainte dans <code>Message</code> si tu dois distinguer les deux. C'est là que les noms explicites du jour 21 servent.</p>

<h3>Pièges courants</h3>
<ul>
<li><strong>Oublier <code>await</code> sur <code>OpenAsync</code></strong> : la commande s'exécute sur une connexion encore fermée et lève « ExecuteReader requires an open and available Connection ».</li>
<li><strong>Partager une connexion entre plusieurs tâches</strong> : <code>SqlConnection</code> n'est pas thread-safe. Deux <code>Task.WhenAll</code> sur la même connexion produisent des erreurs aléatoires ; chaque tâche ouvre la sienne.</li>
<li><strong>Appels synchrones dans une API</strong> : <code>ExecuteReader</code> bloque un thread du pool pendant toute la durée réseau. Sous charge, l'API ralentit sans que la base soit en cause.</li>
<li><strong>Caster sans vérifier</strong> : <code>(int)await command.ExecuteScalarAsync()</code> lève une <code>NullReferenceException</code> si la requête ne renvoie aucune ligne.</li>
<li><strong>Chaîne de connexion de production en développement</strong> : avec les user secrets et une variable d'environnement par environnement, tu ne te connectes jamais par erreur à la vraie base.</li>
</ul>

<div class="note">Dans une application ASP.NET Core, ne crée pas la chaîne de connexion à chaque appel : lis-la une fois depuis <code>IConfiguration</code> et injecte-la. Depuis .NET 7, <code>SqlClientFactory.Instance.CreateDataSource(connectionString)</code> renvoie un <code>DbDataSource</code> enregistrable en singleton, qui fabrique des connexions déjà configurées. Et mesure toujours le pool en charge : un pool saturé se manifeste par des timeouts d'ouverture, pas par des requêtes lentes, et la cause est presque toujours une connexion non libérée ou une requête trop longue.</div>
`,
  examples: [
    {
      title: "Première connexion et ExecuteScalar",
      code: `// dotnet new console -n AdoDemo && cd AdoDemo
// dotnet add package Microsoft.Data.SqlClient
using Microsoft.Data.SqlClient;

const string connectionString =
    "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=OrderFlow_Dev_2026!;" +
    "TrustServerCertificate=True;Application Name=AdoDemo";

// await using : la connexion retourne au pool à la fin du bloc, même en cas d'exception
await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

Console.WriteLine($"Connecté à {connection.DataSource}, base {connection.Database}");

await using var command = new SqlCommand("SELECT @@VERSION", connection);
var version = (string?)await command.ExecuteScalarAsync();
Console.WriteLine(version);

command.CommandText = "SELECT COUNT(*) FROM dbo.Products";
var count = (int)(await command.ExecuteScalarAsync())!;
Console.WriteLine($"{count} produits en base");`,
      explain: "Le mot de passe en dur sert uniquement à ce premier test. L'exemple suivant le sort du code. <code>COUNT(*)</code> renvoie un <code>int</code> ; <code>COUNT_BIG(*)</code> renverrait un <code>long</code>, et un mauvais cast lève une <code>InvalidCastException</code>."
    },
    {
      title: "Chaîne de connexion dans appsettings et user secrets",
      code: `// dotnet add package Microsoft.Extensions.Configuration.Json
// dotnet add package Microsoft.Extensions.Configuration.UserSecrets
// dotnet user-secrets init
// dotnet user-secrets set "ConnectionStrings:OrderFlow" "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=OrderFlow_Dev_2026!;TrustServerCertificate=True"
//
// appsettings.json (versionné, sans secret) :
// { "ConnectionStrings": { "OrderFlow": "" } }
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: true)
    .AddUserSecrets<Program>()          // les secrets écrasent appsettings
    .AddEnvironmentVariables()          // ConnectionStrings__OrderFlow en production
    .Build();

var raw = config.GetConnectionString("OrderFlow");
if (string.IsNullOrWhiteSpace(raw))
    throw new InvalidOperationException("ConnectionStrings:OrderFlow n'est pas configurée.");

// Le builder valide et complète la chaîne sans concaténation
var builder = new SqlConnectionStringBuilder(raw)
{
    ApplicationName = "OrderFlow.Console",
    ConnectTimeout = 5
};

await using var connection = new SqlConnection(builder.ConnectionString);
await connection.OpenAsync();
Console.WriteLine($"OK, serveur {connection.ServerVersion}");

// Afficher la chaîne sans le mot de passe (pour les logs)
builder.Password = "***";
Console.WriteLine(builder.ConnectionString);`,
      explain: "Dans ASP.NET Core, <code>WebApplication.CreateBuilder</code> charge déjà appsettings, user secrets (en développement) et variables d'environnement : <code>builder.Configuration.GetConnectionString(\"OrderFlow\")</code> suffit. Le fichier <code>.csproj</code> doit contenir <code>&lt;UserSecretsId&gt;</code>, ajouté par <code>dotnet user-secrets init</code>."
    },
    {
      title: "ExecuteNonQuery, ExecuteReader et CancellationToken",
      code: `using Microsoft.Data.SqlClient;

var connectionString = Environment.GetEnvironmentVariable("ORDERFLOW_DB")
    ?? throw new InvalidOperationException("Définis ORDERFLOW_DB.");

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
var ct = cts.Token;

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync(ct);

// Écriture : ExecuteNonQuery renvoie le nombre de lignes modifiées
await using (var update = new SqlCommand(
    "UPDATE dbo.Products SET Stock = Stock + 10 WHERE Stock = 0", connection))
{
    update.CommandTimeout = 15; // secondes
    int affected = await update.ExecuteNonQueryAsync(ct);
    Console.WriteLine($"{affected} produit(s) réapprovisionné(s)");
}

// Lecture : ExecuteReader parcourt les lignes une par une, en avant seulement
await using var select = new SqlCommand(
    "SELECT Id, Name, Stock FROM dbo.Products ORDER BY Name", connection);
await using var reader = await select.ExecuteReaderAsync(ct);

while (await reader.ReadAsync(ct))
{
    int id = reader.GetInt32(0);
    string name = reader.GetString(1);
    int stock = reader.GetInt32(2);
    Console.WriteLine($"#{id,-3} {name,-25} stock {stock}");
}`,
      explain: "Tant qu'un <code>SqlDataReader</code> est ouvert, sa connexion est occupée : une autre commande sur la même connexion lèverait « There is already an open DataReader ». Ferme le reader (fin du <code>await using</code>) avant de lancer la commande suivante."
    },
    {
      title: "Gérer les SqlException par numéro",
      code: `using Microsoft.Data.SqlClient;

var connectionString = Environment.GetEnvironmentVariable("ORDERFLOW_DB")!;

try
{
    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    // Ce SKU existe déjà : violation de UQ_Products_Sku
    await using var insert = new SqlCommand(
        "INSERT INTO dbo.Products (Sku, Name, Price, Stock) VALUES ('KB-001', 'Doublon', 10, 1)",
        connection);
    await insert.ExecuteNonQueryAsync();
}
catch (SqlException ex) when (ex.Number is 2627 or 2601)
{
    Console.WriteLine("Ce SKU existe déjà (409 Conflict dans une API).");
}
catch (SqlException ex) when (ex.Number == 547)
{
    Console.WriteLine($"Contrainte violée : {ex.Message}");
}
catch (SqlException ex) when (ex.Number == 1205)
{
    Console.WriteLine("Deadlock : la transaction peut être rejouée.");
}
catch (SqlException ex)
{
    // Inconnue : on journalise tout et on relance
    Console.WriteLine($"Erreur SQL {ex.Number}, classe {ex.Class}, ligne {ex.LineNumber} : {ex.Message}");
    throw;
}`,
      explain: "Le filtre <code>when</code> évite d'attraper puis relancer : l'exception non gérée remonte avec sa pile intacte. <code>ex.Errors</code> contient parfois plusieurs erreurs ; <code>Number</code> renvoie celle de la première."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Tableau de bord en trois chiffres",
      prompt: "<p>Écris un programme console qui affiche, avec une seule connexion ouverte : le nombre de clients, le nombre de commandes en statut <code>Pending</code> et la valeur totale du stock (somme de <code>Price * Stock</code> des produits actifs). Utilise <code>ExecuteScalarAsync</code> et gère le cas où la table des produits est vide.</p>",
      hint: "<p>Réutilise la même <code>SqlCommand</code> en changeant <code>CommandText</code>. <code>SUM</code> sur zéro ligne renvoie NULL : <code>ExecuteScalarAsync</code> donnera alors <code>DBNull.Value</code>. Ici le statut est une constante du code, pas une saisie utilisateur ; les paramètres arrivent demain.</p>",
      solution: `using Microsoft.Data.SqlClient;

var connectionString = Environment.GetEnvironmentVariable("ORDERFLOW_DB")
    ?? throw new InvalidOperationException("Définis ORDERFLOW_DB.");

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();
await using var command = connection.CreateCommand();

command.CommandText = "SELECT COUNT(*) FROM dbo.Customers";
int customers = (int)(await command.ExecuteScalarAsync())!;

command.CommandText = "SELECT COUNT(*) FROM dbo.Orders WHERE Status = 'Pending'";
int pending = (int)(await command.ExecuteScalarAsync())!;

command.CommandText = "SELECT SUM(Price * Stock) FROM dbo.Products WHERE IsActive = 1";
object? raw = await command.ExecuteScalarAsync();
decimal stockValue = raw is null or DBNull ? 0m : (decimal)raw;

Console.WriteLine($"Clients            : {customers}");
Console.WriteLine($"Commandes en cours : {pending}");
Console.WriteLine($"Valeur du stock    : {stockValue:C}");`
    },
    {
      level: "moyen",
      title: "Vérification de santé de la base",
      prompt: "<p>Écris une classe <code>SqlHealthCheck</code> avec une méthode <code>Task&lt;HealthResult&gt; CheckAsync(CancellationToken ct)</code>. Elle tente d'ouvrir une connexion avec un délai d'ouverture de 3 secondes maximum (quelle que soit la chaîne fournie), exécute <code>SELECT 1</code> et renvoie un record <code>HealthResult(bool IsHealthy, TimeSpan Duration, string? Error)</code>. Elle ne doit jamais lever d'exception pour une base indisponible.</p>",
      hint: "<p>Utilise <code>SqlConnectionStringBuilder</code> pour forcer <code>ConnectTimeout = 3</code>, <code>Stopwatch</code> pour la durée, et attrape <code>SqlException</code> et <code>InvalidOperationException</code>. Laisse passer <code>OperationCanceledException</code> : une annulation n'est pas une panne.</p>",
      solution: `using System.Diagnostics;
using Microsoft.Data.SqlClient;

public sealed record HealthResult(bool IsHealthy, TimeSpan Duration, string? Error);

public sealed class SqlHealthCheck(string connectionString)
{
    // Chaîne calculée une fois : même pool pour tous les appels
    private readonly string _connectionString =
        new SqlConnectionStringBuilder(connectionString) { ConnectTimeout = 3 }.ConnectionString;

    public async Task<HealthResult> CheckAsync(CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand("SELECT 1", connection) { CommandTimeout = 3 };
            await command.ExecuteScalarAsync(ct);
            return new HealthResult(true, sw.Elapsed, null);
        }
        catch (SqlException ex)
        {
            return new HealthResult(false, sw.Elapsed, $"SQL {ex.Number} : {ex.Message}");
        }
        catch (InvalidOperationException ex) // pool épuisé, chaîne invalide...
        {
            return new HealthResult(false, sw.Elapsed, ex.Message);
        }
    }
}

// Utilisation
// var check = new SqlHealthCheck(Environment.GetEnvironmentVariable("ORDERFLOW_DB")!);
// var result = await check.CheckAsync();
// Console.WriteLine(result);`
    },
    {
      level: "difficile",
      title: "Réessayer les erreurs transitoires",
      prompt: "<p>Écris une méthode générique <code>Task&lt;T&gt; ExecuteWithRetryAsync&lt;T&gt;(Func&lt;SqlConnection, CancellationToken, Task&lt;T&gt;&gt; operation, CancellationToken ct)</code> qui :</p><ul><li>ouvre une nouvelle connexion à chaque tentative ;</li><li>réessaie jusqu'à 3 fois <strong>uniquement</strong> pour les erreurs transitoires : 1205 (deadlock), -2 (timeout), 40613, 40197, 40501 (Azure SQL indisponible ou surchargé) ;</li><li>attend 200 ms, 400 ms, puis 800 ms entre les tentatives, plus un léger aléa ;</li><li>relance immédiatement toute autre erreur.</li></ul><p>Teste-la avec une opération qui compte les produits.</p>",
      hint: "<p>Un filtre d'exception <code>catch (SqlException ex) when (IsTransient(ex) &amp;&amp; attempt &lt; maxAttempts)</code> laisse remonter la dernière tentative telle quelle. <code>Random.Shared.Next(0, 100)</code> pour l'aléa, <code>Task.Delay(delay, ct)</code> pour l'attente.</p>",
      solution: `using Microsoft.Data.SqlClient;

public sealed class SqlExecutor(string connectionString)
{
    private static readonly HashSet<int> TransientNumbers = [1205, -2, 40613, 40197, 40501];
    private const int MaxAttempts = 4; // 1 essai + 3 nouvelles tentatives

    public async Task<T> ExecuteWithRetryAsync<T>(
        Func<SqlConnection, CancellationToken, Task<T>> operation,
        CancellationToken ct = default)
    {
        for (int attempt = 1; ; attempt++)
        {
            try
            {
                // Nouvelle connexion à chaque tentative : une connexion victime d'erreur n'est pas réutilisée
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync(ct);
                return await operation(connection, ct);
            }
            catch (SqlException ex) when (IsTransient(ex) && attempt < MaxAttempts)
            {
                var delay = TimeSpan.FromMilliseconds(200 * Math.Pow(2, attempt - 1) + Random.Shared.Next(0, 100));
                Console.WriteLine($"Tentative {attempt} échouée (SQL {ex.Number}), nouvel essai dans {delay.TotalMilliseconds:F0} ms");
                await Task.Delay(delay, ct);
            }
        }
    }

    private static bool IsTransient(SqlException ex) =>
        ex.Errors.Cast<SqlError>().Any(e => TransientNumbers.Contains(e.Number));
}

// Test
// var executor = new SqlExecutor(Environment.GetEnvironmentVariable("ORDERFLOW_DB")!);
// int count = await executor.ExecuteWithRetryAsync(async (conn, ct) =>
// {
//     await using var cmd = new SqlCommand("SELECT COUNT(*) FROM dbo.Products", conn);
//     return (int)(await cmd.ExecuteScalarAsync(ct))!;
// });
// Console.WriteLine(count);

// Attention : ne réessaie que des opérations sans effet de bord partiel (lecture, ou transaction complète).
// Microsoft.Data.SqlClient propose aussi SqlRetryLogicBaseProvider (RetryLogicProvider sur la connexion).`
    }
  ],
  project: "<p><strong>Projet OrderFlow.Data.Ado.</strong> Crée une bibliothèque de classes <code>OrderFlow.Data.Ado</code> (<code>dotnet new classlib</code>) avec le package Microsoft.Data.SqlClient, et une console <code>OrderFlow.Ado.Cli</code> qui la référence. Dans la bibliothèque :</p><ul><li>une classe <code>SqlConnectionFactory</code> qui reçoit la chaîne de connexion et expose <code>Task&lt;SqlConnection&gt; OpenAsync(CancellationToken ct)</code> (connexion déjà ouverte) ;</li><li>une classe <code>DatabaseInfo</code> avec <code>Task&lt;bool&gt; CanConnectAsync()</code> et <code>Task&lt;int&gt; CountProductsAsync()</code>.</li></ul><p>La console lit la chaîne depuis les user secrets et affiche le résultat. Aucun mot de passe ne doit apparaître dans le dépôt Git.</p>",
  resources: [
    { label: "Vue d'ensemble d'ADO.NET", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/ado-net-overview" },
    { label: "Présentation de Microsoft.Data.SqlClient", url: "https://learn.microsoft.com/sql/connect/ado-net/introduction-microsoft-data-sqlclient-namespace" },
    { label: "Regroupement de connexions SQL Server (ADO.NET)", url: "https://learn.microsoft.com/sql/connect/ado-net/sql-server-connection-pooling" },
    { label: "Stockage sécurisé des secrets en développement", url: "https://learn.microsoft.com/aspnet/core/security/app-secrets" }
  ]
});

// ───────────────────────── Jour 23 : ADO.NET, paramètres, lecture et mapping ─────────────────────────
window.COURSE.push({
  key: "a-params",
  title: "ADO.NET : paramètres, lecture et mapping",
  summary: "Écrire des requêtes paramétrées immunisées contre l'injection SQL, lire les résultats avec SqlDataReader et les transformer en records C#.",
  objectives: [
    "Démontrer une injection SQL et la corriger avec des paramètres",
    "Déclarer des SqlParameter typés et gérer les valeurs NULL",
    "Lire un SqlDataReader proprement et mapper vers des records",
    "Paginer, insérer en récupérant l'id et lire plusieurs résultats",
    "Lire de gros volumes en streaming avec IAsyncEnumerable"
  ],
  lesson: `
<h3>L'injection SQL, en vrai</h3>
<p>Imagine une recherche de produits écrite par concaténation :</p>
<pre><code>var sql = "SELECT Id, Name FROM dbo.Products WHERE Name LIKE '%" + search + "%'";</code></pre>
<p>Si l'utilisateur tape <code>x' OR 1=1 --</code>, la requête devient <code>... LIKE '%x' OR 1=1 --%'</code> : la condition est toujours vraie, le reste est commenté, et la requête renvoie tout. Avec <code>'; DROP TABLE dbo.Orders; --</code>, elle supprime une table si le compte a les droits. Échapper les apostrophes à la main ne suffit pas : il existe trop de variantes. L'injection SQL figure toujours dans le Top 10 OWASP.</p>
<p>La seule défense fiable : les <strong>paramètres</strong>. La requête contient <code>@Search</code>, et la valeur voyage à part, dans le protocole réseau. SQL Server ne l'interprète jamais comme du code, quel que soit son contenu.</p>

<h3>Déclarer des paramètres</h3>
<pre><code>command.Parameters.Add("@Search", SqlDbType.NVarChar, 200).Value = "%" + search + "%";</code></pre>
<p>Préfère <code>Add</code> avec le type et la taille à <code>AddWithValue</code>, qui devine le type à partir de la valeur C# :</p>
<table>
<thead><tr><th>Problème de <code>AddWithValue</code></th><th>Conséquence</th></tr></thead>
<tbody>
<tr><td>Une <code>string</code> devient <code>NVARCHAR</code> de la longueur de la valeur</td><td>Un plan d'exécution différent par longueur : le cache de plans se remplit</td></tr>
<tr><td><code>NVARCHAR</code> comparé à une colonne <code>VARCHAR</code></td><td>Conversion implicite côté serveur, l'index n'est plus utilisé (scan)</td></tr>
<tr><td>Un <code>decimal</code> prend la précision de la valeur</td><td>Mêmes problèmes de cache et risques d'arrondi</td></tr>
<tr><td><code>DateTime</code> devient <code>DATETIME</code></td><td>Perte de précision face à une colonne <code>DATETIME2</code></td></tr>
</tbody>
</table>
<p>Pour un <code>DECIMAL(18,2)</code>, renseigne <code>Precision</code> et <code>Scale</code> sur le paramètre. Pour <code>NVARCHAR(MAX)</code>, la taille vaut <code>-1</code>.</p>
<p>Une valeur NULL ne s'écrit pas <code>null</code> mais <code>DBNull.Value</code> : un paramètre dont <code>Value</code> vaut <code>null</code> est considéré comme absent, et SQL Server répond « The parameterized query expects the parameter '@Description', which was not supplied ». Écris <code>(object?)description ?? DBNull.Value</code>.</p>
<p>Ce que les paramètres ne protègent pas : les noms de tables, de colonnes et les mots-clés comme <code>ASC</code>/<code>DESC</code>. Pour un tri choisi par l'utilisateur, utilise une liste blanche : un <code>switch</code> qui associe une valeur autorisée (<code>"price"</code>) à un fragment SQL écrit par toi (<code>"Price"</code>).</p>

<h3>Correspondance des types de paramètres</h3>
<table>
<thead><tr><th>Colonne SQL Server</th><th><code>SqlDbType</code></th><th>Taille / précision</th><th>Valeur C#</th></tr></thead>
<tbody>
<tr><td><code>INT</code></td><td><code>Int</code></td><td>-</td><td><code>int</code></td></tr>
<tr><td><code>BIGINT</code></td><td><code>BigInt</code></td><td>-</td><td><code>long</code></td></tr>
<tr><td><code>NVARCHAR(200)</code></td><td><code>NVarChar</code></td><td>200</td><td><code>string</code></td></tr>
<tr><td><code>VARCHAR(50)</code></td><td><code>VarChar</code></td><td>50</td><td><code>string</code></td></tr>
<tr><td><code>NVARCHAR(MAX)</code></td><td><code>NVarChar</code></td><td>-1</td><td><code>string</code></td></tr>
<tr><td><code>DECIMAL(18,2)</code></td><td><code>Decimal</code></td><td>Precision 18, Scale 2</td><td><code>decimal</code></td></tr>
<tr><td><code>DATETIME2</code></td><td><code>DateTime2</code></td><td>-</td><td><code>DateTime</code></td></tr>
<tr><td><code>BIT</code></td><td><code>Bit</code></td><td>-</td><td><code>bool</code></td></tr>
<tr><td><code>UNIQUEIDENTIFIER</code></td><td><code>UniqueIdentifier</code></td><td>-</td><td><code>Guid</code></td></tr>
<tr><td><code>ROWVERSION</code></td><td><code>Timestamp</code></td><td>8</td><td><code>byte[]</code></td></tr>
</tbody>
</table>
<p>Une même commande peut être exécutée plusieurs fois en changeant seulement les valeurs : déclare les paramètres une fois, puis modifie <code>command.Parameters["@Id"].Value</code> dans la boucle. Le texte SQL étant identique, SQL Server réutilise le même plan.</p>

<h3>Passer une liste de valeurs</h3>
<p>Un filtre <code>WHERE Id IN (1, 2, 3)</code> pose problème : on ne peut pas passer une liste dans un seul paramètre scalaire, et concaténer les ids rouvre la porte à l'injection. Trois solutions propres :</p>
<ul>
<li>générer un paramètre par valeur (<code>@Id0, @Id1, @Id2</code>) : simple, mais un plan par taille de liste et une limite de 2 100 paramètres ;</li>
<li>passer une chaîne et la découper côté serveur : <code>WHERE Id IN (SELECT value FROM STRING_SPLIT(@Ids, ','))</code>, ou un tableau JSON lu avec <code>OPENJSON(@Ids)</code> ;</li>
<li>un <em>table-valued parameter</em>, la solution la plus robuste pour de gros volumes, vue au jour 25.</li>
</ul>

<h3>Lire avec SqlDataReader</h3>
<p>Le reader avance ligne par ligne, en avant seulement, et ne garde en mémoire que la ligne courante. C'est ce qui le rend rapide et économe.</p>
<table>
<thead><tr><th>Méthode</th><th>Usage</th></tr></thead>
<tbody>
<tr><td><code>ReadAsync()</code></td><td>Passe à la ligne suivante, <code>false</code> à la fin</td></tr>
<tr><td><code>GetOrdinal("Name")</code></td><td>Index d'une colonne par son nom, à appeler une fois avant la boucle</td></tr>
<tr><td><code>GetInt32(i)</code>, <code>GetString(i)</code>, <code>GetDecimal(i)</code>, <code>GetBoolean(i)</code>, <code>GetDateTime(i)</code></td><td>Lecture typée, sans boxing</td></tr>
<tr><td><code>GetFieldValue&lt;T&gt;(i)</code></td><td>Lecture générique (<code>Guid</code>, <code>byte[]</code>, <code>DateTimeOffset</code>...)</td></tr>
<tr><td><code>IsDBNull(i)</code></td><td>Obligatoire avant de lire une colonne nullable</td></tr>
<tr><td><code>NextResultAsync()</code></td><td>Passe au jeu de résultats suivant</td></tr>
</tbody>
</table>
<p>Les getters typés lèvent une exception sur une valeur NULL (<code>SqlNullValueException</code>) ou sur un type différent (<code>GetInt32</code> sur un <code>BIGINT</code> lève <code>InvalidCastException</code>). Fais correspondre exactement types SQL et types C# : c'est le tableau du jour 21.</p>

<h3>Mapper vers des records</h3>
<p>Isole la conversion d'une ligne en objet dans une méthode <code>Map</code> statique, et récupère les index de colonnes une fois. En sélectionnant des colonnes nommées (jamais <code>SELECT *</code>), l'ordre est sous ton contrôle et un ajout de colonne en base ne casse rien. C'est exactement le travail que Dapper automatise ; l'écrire à la main une fois permet de comprendre ce qu'il fait et ce qu'il coûte.</p>

<h3>Insérer et récupérer l'identifiant</h3>
<p>Trois options en SQL Server :</p>
<ul>
<li><code>OUTPUT INSERTED.Id</code> : la plus claire, renvoie aussi d'autres colonnes générées (<code>RowVersion</code>, <code>PublicId</code>). Lis-la avec <code>ExecuteScalarAsync</code>. Attention, elle n'est pas compatible avec un trigger sur la table sans clause <code>INTO</code>.</li>
<li><code>SELECT SCOPE_IDENTITY()</code> après l'<code>INSERT</code>, dans la même commande : renvoie l'identité de ton instruction, sans être pollué par un trigger. Son type est <code>DECIMAL(38,0)</code> : convertis-le avec <code>Convert.ToInt32</code>, ou écris <code>CAST(SCOPE_IDENTITY() AS INT)</code>.</li>
<li><code>@@IDENTITY</code> : à éviter, elle peut renvoyer l'id inséré par un trigger dans une autre table.</li>
</ul>

<h3>Plusieurs résultats et options de lecture</h3>
<p>Une même commande peut contenir plusieurs <code>SELECT</code> : par exemple la page de résultats et le nombre total pour la pagination. Le reader lit le premier jeu, puis <code>NextResultAsync()</code> passe au suivant. Un seul aller-retour réseau au lieu de deux.</p>
<p><code>ExecuteReaderAsync</code> accepte des options <code>CommandBehavior</code> : <code>SingleRow</code> quand tu n'attends qu'une ligne, <code>SequentialAccess</code> pour lire de grosses colonnes (<code>NVARCHAR(MAX)</code>, <code>VARBINARY(MAX)</code>) en flux, à condition de lire les colonnes dans l'ordre, et <code>CloseConnection</code> qui ferme la connexion avec le reader.</p>

<h3>Streaming de gros volumes</h3>
<p>Charger 500 000 lignes dans une <code>List</code> avant de les exporter consomme de la mémoire pour rien. Une méthode qui renvoie <code>IAsyncEnumerable&lt;T&gt;</code> et fait <code>yield return</code> dans la boucle <code>ReadAsync</code> ne garde qu'une ligne à la fois. L'appelant consomme avec <code>await foreach</code>. La connexion reste ouverte pendant toute l'énumération : garde ce traitement court ou fais-le dans un job en arrière-plan.</p>

<h3>Pièges courants</h3>
<ul>
<li><strong>Réutiliser un <code>SqlParameter</code> dans deux commandes</strong> : un paramètre n'appartient qu'à une collection, et l'ajouter ailleurs lève « The SqlParameter is already contained by another SqlParameterCollection ».</li>
<li><strong>Lire une colonne nullable sans <code>IsDBNull</code></strong> : l'erreur n'apparaît qu'en production, le jour où une ligne a vraiment une valeur NULL.</li>
<li><strong>Mélanger <code>GetOrdinal</code> et un <code>SELECT *</code></strong> : l'ordre et la liste des colonnes peuvent changer avec une migration. Nomme toujours les colonnes.</li>
<li><strong>Oublier de parcourir tous les résultats</strong> : un <code>SELECT</code> non lu ou une erreur dans le second lot peut passer inaperçue tant que le reader n'a pas atteint ce jeu de résultats.</li>
</ul>

<div class="note">Deux règles que les revues de code vérifient systématiquement : aucune valeur venant de l'extérieur ne doit être concaténée dans du SQL, et chaque paramètre a un type et une taille qui correspondent à la colonne. La première ferme la porte à l'injection, la seconde évite des index ignorés et un cache de plans saturé, deux problèmes invisibles en développement qui apparaissent sous la charge. Dans les requêtes dynamiques (filtres optionnels, tri), les valeurs restent des paramètres et seuls des fragments écrits par toi sont concaténés.</div>
`,
  examples: [
    {
      title: "Injection SQL : la faille puis la correction",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

var connectionString = Environment.GetEnvironmentVariable("ORDERFLOW_DB")!;
string userInput = "x' OR 1=1 --"; // saisie malveillante

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

// ❌ VULNÉRABLE : la saisie devient du code SQL
var unsafeSql = "SELECT Id, Name FROM dbo.Products WHERE Name LIKE '%" + userInput + "%'";
await using (var bad = new SqlCommand(unsafeSql, connection))
await using (var reader = await bad.ExecuteReaderAsync())
{
    int rows = 0;
    while (await reader.ReadAsync()) rows++;
    Console.WriteLine($"Requête concaténée : {rows} ligne(s) renvoyée(s), soit toute la table");
}

// ✅ SÉCURISÉ : la saisie est une valeur, jamais du code
const string safeSql = "SELECT Id, Name FROM dbo.Products WHERE Name LIKE @Search";
await using (var good = new SqlCommand(safeSql, connection))
{
    good.Parameters.Add("@Search", SqlDbType.NVarChar, 200).Value = $"%{userInput}%";
    await using var reader = await good.ExecuteReaderAsync();
    int rows = 0;
    while (await reader.ReadAsync()) rows++;
    Console.WriteLine($"Requête paramétrée : {rows} ligne(s), aucun produit ne s'appelle ainsi");
}`,
      explain: "Le paramètre est déclaré en <code>NVarChar</code> de 200 caractères : la taille de la colonne <code>Name</code>. Les caractères <code>%</code> et <code>_</code> restent des jokers de <code>LIKE</code> ; pour une recherche littérale, échappe-les ou utilise <code>CHARINDEX</code>."
    },
    {
      title: "Lire une ligne et la mapper vers un record",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

public sealed record Product(
    int Id, string Sku, string Name, string? Description, decimal Price, int Stock, bool IsActive);

public static class ProductReader
{
    public const string Columns = "Id, Sku, Name, Description, Price, Stock, IsActive";

    // Mapping d'une ligne : ordre identique à Columns
    public static Product Map(SqlDataReader r) => new(
        Id: r.GetInt32(0),
        Sku: r.GetString(1),
        Name: r.GetString(2),
        Description: r.IsDBNull(3) ? null : r.GetString(3),
        Price: r.GetDecimal(4),
        Stock: r.GetInt32(5),
        IsActive: r.GetBoolean(6));

    public static async Task<Product?> GetByIdAsync(SqlConnection connection, int id, CancellationToken ct = default)
    {
        await using var command = new SqlCommand(
            $"SELECT {Columns} FROM dbo.Products WHERE Id = @Id", connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SingleRow, ct);
        return await reader.ReadAsync(ct) ? Map(reader) : null;
    }
}

// Utilisation
// await using var conn = new SqlConnection(Environment.GetEnvironmentVariable("ORDERFLOW_DB"));
// await conn.OpenAsync();
// var product = await ProductReader.GetByIdAsync(conn, 1);
// Console.WriteLine(product?.ToString() ?? "Introuvable");`,
      explain: "La seule interpolation dans le SQL est <code>{Columns}</code>, une constante du code : aucune donnée extérieure. Le <code>null</code> pour « introuvable » laisse l'appelant décider : renvoyer 404 dans une API, par exemple."
    },
    {
      title: "Recherche paginée avec total en un seul aller-retour",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public static class ProductSearch
{
    public static async Task<PagedResult<Product>> SearchAsync(
        SqlConnection connection, string? term, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100); // borne côté serveur, quelle que soit la demande

        // Deux SELECT dans la même commande : la page, puis le total
        const string sql = $"""
            SELECT {ProductReader.Columns}
            FROM dbo.Products
            WHERE IsActive = 1 AND (@Term IS NULL OR Name LIKE @Term)
            ORDER BY Name, Id
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

            SELECT COUNT(*)
            FROM dbo.Products
            WHERE IsActive = 1 AND (@Term IS NULL OR Name LIKE @Term);
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Term", SqlDbType.NVarChar, 200).Value =
            string.IsNullOrWhiteSpace(term) ? DBNull.Value : $"%{term.Trim()}%";
        command.Parameters.Add("@Offset", SqlDbType.Int).Value = (page - 1) * pageSize;
        command.Parameters.Add("@PageSize", SqlDbType.Int).Value = pageSize;

        await using var reader = await command.ExecuteReaderAsync(ct);

        var items = new List<Product>(pageSize);
        while (await reader.ReadAsync(ct))
            items.Add(ProductReader.Map(reader));

        await reader.NextResultAsync(ct);   // passe au second SELECT
        await reader.ReadAsync(ct);
        int total = reader.GetInt32(0);

        return new PagedResult<Product>(items, total, page, pageSize);
    }
}`,
      explain: "<code>(@Term IS NULL OR Name LIKE @Term)</code> rend le filtre optionnel avec une seule requête. Sur de grosses tables, ce motif peut produire un plan médiocre ; l'exercice « moyen » montre l'alternative qui construit le <code>WHERE</code> selon les filtres présents."
    },
    {
      title: "Insérer et récupérer l'id avec OUTPUT INSERTED",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

public sealed record NewProduct(string Sku, string Name, string? Description, decimal Price, int Stock);

public static class ProductWriter
{
    public static async Task<int> InsertAsync(SqlConnection connection, NewProduct p, CancellationToken ct = default)
    {
        const string sql = """
            INSERT INTO dbo.Products (Sku, Name, Description, Price, Stock)
            OUTPUT INSERTED.Id
            VALUES (@Sku, @Name, @Description, @Price, @Stock);
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Sku", SqlDbType.NVarChar, 32).Value = p.Sku;
        command.Parameters.Add("@Name", SqlDbType.NVarChar, 200).Value = p.Name;
        // NVARCHAR(MAX) : taille -1 ; null C# → DBNull.Value
        command.Parameters.Add("@Description", SqlDbType.NVarChar, -1).Value = (object?)p.Description ?? DBNull.Value;

        var price = command.Parameters.Add("@Price", SqlDbType.Decimal);
        price.Precision = 18;
        price.Scale = 2;
        price.Value = p.Price;

        command.Parameters.Add("@Stock", SqlDbType.Int).Value = p.Stock;

        return (int)(await command.ExecuteScalarAsync(ct))!;
    }
}

// var id = await ProductWriter.InsertAsync(conn, new NewProduct("TB-007", "Tapis de souris", null, 12.90m, 150));
// Console.WriteLine($"Produit créé avec l'id {id}");`,
      explain: "Si le SKU existe déjà, <code>ExecuteScalarAsync</code> lève une <code>SqlException</code> numéro 2627 (jour 22) : c'est la base qui garantit l'unicité, même avec deux appels simultanés."
    },
    {
      title: "Streaming d'un gros résultat avec IAsyncEnumerable",
      code: `using System.Data;
using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;

public static class ProductExport
{
    // Une seule ligne en mémoire à la fois, même pour des millions de produits
    public static async IAsyncEnumerable<Product> StreamAllAsync(
        string connectionString,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(ct);

        await using var command = new SqlCommand(
            $"SELECT {ProductReader.Columns} FROM dbo.Products ORDER BY Id", connection)
        {
            CommandTimeout = 300 // un export peut être long
        };

        await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SequentialAccess, ct);
        while (await reader.ReadAsync(ct))
            yield return ProductReader.Map(reader); // colonnes lues dans l'ordre : compatible SequentialAccess
    }
}

// Utilisation : écriture CSV au fil de l'eau
// await using var file = new StreamWriter("products.csv");
// await file.WriteLineAsync("Id;Sku;Name;Price;Stock");
// await foreach (var p in ProductExport.StreamAllAsync(connectionString))
//     await file.WriteLineAsync($"{p.Id};{p.Sku};{p.Name};{p.Price};{p.Stock}");`,
      explain: "Avec <code>SequentialAccess</code>, chaque colonne doit être lue dans l'ordre et une seule fois : c'est le cas de <code>Map</code>. Dans une API, renvoyer directement un <code>IAsyncEnumerable</code> depuis un endpoint fait sérialiser le JSON au fil de l'eau."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trouver un client par email",
      prompt: "<p>Écris <code>Task&lt;Customer?&gt; GetByEmailAsync(SqlConnection connection, string email, CancellationToken ct)</code> avec le record <code>Customer(int Id, string Email, string FullName, DateTime CreatedAt)</code>. La comparaison doit ignorer les espaces autour de la saisie. Teste avec <code>bob@example.com</code> et avec <code>' OR 1=1 --</code>.</p>",
      hint: "<p>Paramètre <code>@Email</code> en <code>NVarChar</code> de 256. <code>CommandBehavior.SingleRow</code> puisque l'email est unique. La collation par défaut de SQL Server est insensible à la casse, inutile d'appeler <code>LOWER</code>.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

public sealed record Customer(int Id, string Email, string FullName, DateTime CreatedAt);

public static class CustomerQueries
{
    public static async Task<Customer?> GetByEmailAsync(
        SqlConnection connection, string email, CancellationToken ct = default)
    {
        await using var command = new SqlCommand(
            "SELECT Id, Email, FullName, CreatedAt FROM dbo.Customers WHERE Email = @Email", connection);
        command.Parameters.Add("@Email", SqlDbType.NVarChar, 256).Value = email.Trim();

        await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SingleRow, ct);
        if (!await reader.ReadAsync(ct)) return null;

        return new Customer(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetDateTime(3));
    }
}

// var bob = await CustomerQueries.GetByEmailAsync(conn, "  bob@example.com ");
// Console.WriteLine(bob);                                                       // Customer { Id = 2, ... }
// Console.WriteLine(await CustomerQueries.GetByEmailAsync(conn, "' OR 1=1 --")); // vide : aucun client`
    },
    {
      level: "moyen",
      title: "Recherche multicritère et tri sécurisé",
      prompt: "<p>Écris <code>SearchAsync(SqlConnection connection, ProductFilter filter, CancellationToken ct)</code> avec <code>record ProductFilter(string? Name, decimal? MinPrice, decimal? MaxPrice, bool InStockOnly, string? SortBy, bool Descending)</code>. Exigences :</p><ul><li>chaque filtre n'est ajouté au <code>WHERE</code> que s'il est renseigné ;</li><li>toutes les valeurs passent par des paramètres ;</li><li><code>SortBy</code> accepte <code>name</code>, <code>price</code> ou <code>stock</code> (tri par nom sinon), sans jamais concaténer la saisie ;</li><li>maximum 50 résultats.</li></ul>",
      hint: "<p>Construis une <code>List&lt;string&gt;</code> de conditions et ajoute le paramètre correspondant en même temps. Pour le tri, un <code>switch</code> expression qui renvoie un nom de colonne écrit en dur. Assemble avec <code>string.Join(\" AND \", conditions)</code>.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

public sealed record ProductFilter(
    string? Name, decimal? MinPrice, decimal? MaxPrice, bool InStockOnly, string? SortBy, bool Descending);

public static class ProductFilterQuery
{
    public static async Task<List<Product>> SearchAsync(
        SqlConnection connection, ProductFilter filter, CancellationToken ct = default)
    {
        await using var command = connection.CreateCommand();
        var conditions = new List<string> { "IsActive = 1" };

        if (!string.IsNullOrWhiteSpace(filter.Name))
        {
            conditions.Add("Name LIKE @Name");
            command.Parameters.Add("@Name", SqlDbType.NVarChar, 200).Value = $"%{filter.Name.Trim()}%";
        }
        if (filter.MinPrice is { } min)
        {
            conditions.Add("Price >= @MinPrice");
            var p = command.Parameters.Add("@MinPrice", SqlDbType.Decimal);
            p.Precision = 18; p.Scale = 2; p.Value = min;
        }
        if (filter.MaxPrice is { } max)
        {
            conditions.Add("Price <= @MaxPrice");
            var p = command.Parameters.Add("@MaxPrice", SqlDbType.Decimal);
            p.Precision = 18; p.Scale = 2; p.Value = max;
        }
        if (filter.InStockOnly)
            conditions.Add("Stock > 0");

        // Liste blanche : la saisie choisit parmi des fragments écrits ici, elle n'est jamais copiée
        string orderColumn = filter.SortBy?.ToLowerInvariant() switch
        {
            "price" => "Price",
            "stock" => "Stock",
            _ => "Name"
        };
        string direction = filter.Descending ? "DESC" : "ASC";

        command.CommandText = $"""
            SELECT TOP (50) {ProductReader.Columns}
            FROM dbo.Products
            WHERE {string.Join(" AND ", conditions)}
            ORDER BY {orderColumn} {direction}, Id;
            """;

        var results = new List<Product>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
            results.Add(ProductReader.Map(reader));
        return results;
    }
}

// var list = await ProductFilterQuery.SearchAsync(conn, new ProductFilter("c", 10, 300, true, "price", true));`
    },
    {
      level: "difficile",
      title: "Lecteur générique et commande avec ses lignes",
      prompt: "<p>1. Écris une méthode d'extension <code>Task&lt;List&lt;T&gt;&gt; QueryAsync&lt;T&gt;(this SqlConnection connection, string sql, Func&lt;SqlDataReader, T&gt; map, Action&lt;SqlParameterCollection&gt;? parameters = null, CancellationToken ct = default)</code>, un mini-Dapper.</p><p>2. Avec une seule commande à deux résultats, écris <code>GetOrderDetailsAsync(int orderId)</code> qui renvoie <code>OrderDetails(int Id, string Status, decimal Total, string CustomerName, IReadOnlyList&lt;OrderLineDto&gt; Lines)</code>, ou <code>null</code> si la commande n'existe pas. <code>OrderLineDto(string ProductName, int Quantity, decimal UnitPrice)</code> expose aussi une propriété calculée <code>LineTotal</code>.</p>",
      hint: "<p>Pour le point 2, le premier <code>SELECT</code> joint <code>Orders</code> et <code>Customers</code>, le second joint <code>OrderLines</code> et <code>Products</code>. Si la première lecture ne trouve rien, renvoie <code>null</code> sans lire le second résultat. Utilise <code>GetOrdinal</code> pour ne pas dépendre de la position des colonnes.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

public static class SqlConnectionExtensions
{
    // Mini-Dapper : exécute, mappe chaque ligne, renvoie une liste
    public static async Task<List<T>> QueryAsync<T>(
        this SqlConnection connection,
        string sql,
        Func<SqlDataReader, T> map,
        Action<SqlParameterCollection>? parameters = null,
        CancellationToken ct = default)
    {
        await using var command = new SqlCommand(sql, connection);
        parameters?.Invoke(command.Parameters);

        var list = new List<T>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
            list.Add(map(reader));
        return list;
    }
}

public sealed record OrderLineDto(string ProductName, int Quantity, decimal UnitPrice)
{
    public decimal LineTotal => Quantity * UnitPrice;
}

public sealed record OrderDetails(
    int Id, string Status, decimal Total, string CustomerName, IReadOnlyList<OrderLineDto> Lines);

public static class OrderQueries
{
    public static async Task<OrderDetails?> GetOrderDetailsAsync(
        SqlConnection connection, int orderId, CancellationToken ct = default)
    {
        const string sql = """
            SELECT o.Id, o.Status, o.Total, c.FullName AS CustomerName
            FROM dbo.Orders AS o
            INNER JOIN dbo.Customers AS c ON c.Id = o.CustomerId
            WHERE o.Id = @OrderId;

            SELECT p.Name AS ProductName, l.Quantity, l.UnitPrice
            FROM dbo.OrderLines AS l
            INNER JOIN dbo.Products AS p ON p.Id = l.ProductId
            WHERE l.OrderId = @OrderId
            ORDER BY l.Id;
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@OrderId", SqlDbType.Int).Value = orderId;
        await using var reader = await command.ExecuteReaderAsync(ct);

        if (!await reader.ReadAsync(ct))
            return null; // commande inexistante

        int id = reader.GetInt32(reader.GetOrdinal("Id"));
        string status = reader.GetString(reader.GetOrdinal("Status"));
        decimal total = reader.GetDecimal(reader.GetOrdinal("Total"));
        string customer = reader.GetString(reader.GetOrdinal("CustomerName"));

        await reader.NextResultAsync(ct);
        int nameOrd = reader.GetOrdinal("ProductName");
        int qtyOrd = reader.GetOrdinal("Quantity");
        int priceOrd = reader.GetOrdinal("UnitPrice");

        var lines = new List<OrderLineDto>();
        while (await reader.ReadAsync(ct))
            lines.Add(new OrderLineDto(reader.GetString(nameOrd), reader.GetInt32(qtyOrd), reader.GetDecimal(priceOrd)));

        return new OrderDetails(id, status, total, customer, lines);
    }
}

// Utilisation du mini-Dapper :
// var cheap = await conn.QueryAsync(
//     $"SELECT {ProductReader.Columns} FROM dbo.Products WHERE Price < @Max",
//     ProductReader.Map,
//     p => p.Add("@Max", SqlDbType.Decimal).Value = 50m);
//
// var details = await OrderQueries.GetOrderDetailsAsync(conn, 1);
// foreach (var line in details!.Lines) Console.WriteLine($"{line.ProductName} x{line.Quantity} = {line.LineTotal:C}");`
    }
  ],
  project: "<p><strong>ProductQueries en ADO.NET pur.</strong> Dans <code>OrderFlow.Data.Ado</code>, crée la classe <code>ProductQueries</code> qui reçoit la <code>SqlConnectionFactory</code> du jour 22 et expose :</p><ul><li><code>Task&lt;Product?&gt; GetByIdAsync(int id, CancellationToken ct)</code> ;</li><li><code>Task&lt;PagedResult&lt;Product&gt;&gt; SearchAsync(string? term, int page, int pageSize, CancellationToken ct)</code> avec le total en un seul aller-retour ;</li><li><code>Task&lt;int&gt; InsertAsync(NewProduct product, CancellationToken ct)</code> qui renvoie l'id et transforme l'erreur 2627 en <code>DuplicateSkuException</code>.</li></ul><p>Chaque paramètre est typé avec sa taille réelle, aucune saisie n'est concaténée. Ajoute à la console un menu « rechercher / afficher / créer » pour tester les trois méthodes.</p>",
  resources: [
    { label: "Configuration des paramètres et types de données (ADO.NET)", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/configuring-parameters-and-parameter-data-types" },
    { label: "Récupération de données avec un DataReader", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/retrieving-data-using-a-datareader" },
    { label: "Mappages de types de données SQL Server", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/sql-server-data-type-mappings" },
    { label: "Injection SQL", url: "https://learn.microsoft.com/sql/relational-databases/security/sql-injection" }
  ]
});
