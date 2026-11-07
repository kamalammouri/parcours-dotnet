window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 2 - ADO.NET avancé et Dapper
// 1. Transactions avec SqlTransaction
// =====================================================================
window.COURSE.push({
  key: "ado-transactions",
  title: "Transactions avec SqlTransaction",
  summary: "Tu sauras regrouper plusieurs requêtes SQL pour qu'elles réussissent toutes ensemble ou soient toutes annulées.",
  objectives: [
    "Comprendre pourquoi une commande OrderFlow a besoin d'une transaction",
    "Ouvrir une transaction, la passer aux commandes, puis Commit ou Rollback",
    "Annuler proprement quand une règle métier échoue",
    "Éviter les deux pièges classiques : la commande sans transaction et l'oubli du Commit"
  ],
  analogy: `<p>Pense à un <strong>virement bancaire</strong> : on retire 100 € d'un compte et on ajoute 100 € sur un autre. Si la banque plante entre les deux, l'argent ne doit pas disparaître dans la nature.</p>
<p>La banque traite donc les deux opérations comme un <strong>seul bloc</strong> : soit les deux sont faites, soit aucune. Une transaction SQL, c'est exactement ce bloc « tout ou rien ».</p>`,
  lesson: `<h3>Le problème : une commande, c'est plusieurs requêtes</h3>
<p>Dans OrderFlow, passer une commande demande trois écritures : insérer une ligne dans <code>Orders</code>, insérer ses lignes dans <code>OrderLines</code>, puis baisser le <code>Stock</code> des produits. Au chapitre précédent, chaque <code>SqlCommand</code> était validée dès son exécution.</p>
<p>Imagine que la troisième requête échoue (coupure réseau, stock négatif refusé). Les deux premières sont déjà en base : tu as une commande enregistrée mais un stock faux. La base est devenue <strong>incohérente</strong>, et personne ne s'en rendra compte avant l'inventaire.</p>

<h3>Une transaction : tout ou rien</h3>
<p>Une <strong>transaction</strong> est un groupe de requêtes que SQL Server traite comme une seule opération. Tant que tu n'as pas dit « je valide », rien n'est définitif. Deux issues possibles :</p>
<ul>
<li><strong>Commit</strong> (valider) : toutes les modifications deviennent définitives d'un coup.</li>
<li><strong>Rollback</strong> (annuler) : toutes les modifications sont effacées, comme si rien ne s'était passé.</li>
</ul>
<div class="flow"><span>Begin</span><span>Requête 1, 2, 3</span><span>Commit si tout va bien</span><span>Rollback sinon</span></div>
<p>On résume souvent les garanties d'une transaction par le sigle <strong>ACID</strong> : Atomique (tout ou rien), Cohérente (les règles de la base sont respectées), Isolée (les autres ne voient pas ton travail en cours) et Durable (une fois validé, ça survit à une panne). Pour débuter, retiens surtout le « tout ou rien ».</p>

<h3>Le code en trois temps</h3>
<p>Avec ADO.NET, la transaction appartient à une connexion <strong>déjà ouverte</strong>. On la démarre avec <code>BeginTransactionAsync()</code>. Cette méthode renvoie un <code>DbTransaction</code> (le type général) : on le convertit en <code>SqlTransaction</code> avec un cast <code>(SqlTransaction)</code> pour pouvoir le donner aux commandes.</p>
<p>Ensuite, chaque <code>SqlCommand</code> reçoit la transaction en troisième argument : <code>new SqlCommand(sql, conn, tx)</code>. Enfin, on termine par <code>CommitAsync()</code> dans le <code>try</code>, et par <code>RollbackAsync()</code> dans le <code>catch</code>.</p>
<pre class="diagram">
 SqlConnection (ouverte)
  |
  +-- SqlTransaction tx
       |
       +-- INSERT Orders      (conn, tx)
       +-- INSERT OrderLines  (conn, tx)
       +-- UPDATE Products    (conn, tx)
       |
       +-- CommitAsync() ou RollbackAsync()
</pre>
<div class="compare"><div><h4>Sans transaction</h4><p>Chaque requête est validée seule. Une erreur au milieu laisse une base à moitié modifiée.</p></div><div><h4>Avec transaction</h4><p>Les requêtes sont validées ensemble. Une erreur au milieu, et tout est annulé.</p></div></div>

<h3>Annuler sur une règle métier</h3>
<p>Une transaction ne sert pas qu'en cas de panne. Tu peux aussi annuler volontairement quand une règle n'est pas respectée. L'astuce classique pour le stock : <code>UPDATE Products SET Stock = Stock - 3 WHERE Id = @Id AND Stock &gt;= 3</code>. Si le stock est insuffisant, la condition ne trouve aucune ligne et <code>ExecuteNonQueryAsync()</code> renvoie <strong>0</strong>. Tu lances alors une exception, le <code>catch</code> fait le Rollback, et la commande déjà insérée disparaît.</p>
<p>Ce « vérifier et modifier dans la même requête » est important : si tu lisais le stock d'abord puis le modifiais ensuite, un autre utilisateur pourrait commander entre les deux.</p>

<h3>Les deux pièges</h3>
<p><strong>Piège 1 : oublier de donner la transaction à une commande.</strong> Si la connexion a une transaction en cours et que tu crées <code>new SqlCommand(sql, conn)</code> sans <code>tx</code>, l'exécution lance une <code>InvalidOperationException</code>. Le message dit que la commande doit avoir une transaction. Bonne nouvelle : l'erreur est immédiate, tu ne peux pas la rater.</p>
<p><strong>Piège 2 : oublier le Commit.</strong> Si la transaction est libérée (fin du <code>using</code>) sans <code>CommitAsync()</code>, elle est <strong>annulée automatiquement</strong>. Aucune erreur, aucun message : ton travail disparaît en silence. Si « rien n'est enregistré », cherche d'abord le Commit manquant.</p>
<div class="tip">La règle d'or : une transaction = une connexion ouverte + <code>tx</code> passé à <strong>chaque</strong> commande + <code>CommitAsync()</code> à la fin du <code>try</code>. Garde la transaction la plus courte possible : pendant qu'elle est ouverte, les lignes modifiées sont verrouillées pour les autres.</div>
<div class="note">Ne mets jamais d'attente utilisateur (un <code>Console.ReadLine()</code>, un appel HTTP lent) au milieu d'une transaction. Prépare toutes les données avant, ouvre la transaction, écris, valide. Une transaction longue bloque les autres requêtes et finit en blocage ou en délai dépassé.</div>`,
  examples: [
    {
      title: "Passer une commande dans une transaction",
      code: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

// Un produit de démonstration avec 10 pièces en stock
var create = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (N'Casque', 59.90, 10)", conn);
int productId = (int)(await create.ExecuteScalarAsync())!;
await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
try
{
    // 1. La commande, pour le premier client
    var order = new SqlCommand("INSERT INTO Orders (CustomerId, OrderDate, Status) OUTPUT INSERTED.Id SELECT TOP 1 Id, SYSUTCDATETIME(), 'Pending' FROM Customers ORDER BY Id", conn, tx);
    int orderId = (int)(await order.ExecuteScalarAsync())!;

    // 2. La ligne : 2 casques
    var line = new SqlCommand("INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES (@OrderId, @ProductId, 2, 59.90)", conn, tx);
    line.Parameters.AddWithValue("@OrderId", orderId);
    line.Parameters.AddWithValue("@ProductId", productId);
    await line.ExecuteNonQueryAsync();

    // 3. Le stock baisse de 2
    var stock = new SqlCommand("UPDATE Products SET Stock = Stock - 2 WHERE Id = @ProductId", conn, tx);
    stock.Parameters.AddWithValue("@ProductId", productId);
    await stock.ExecuteNonQueryAsync();

    await tx.CommitAsync(); // on valide les 3 d'un coup
    Console.WriteLine("Commande validée");
}
catch
{
    await tx.RollbackAsync(); // on annule les 3 d'un coup
    Console.WriteLine("Commande annulée");
    throw;
}

var check = new SqlCommand("SELECT Stock FROM Products WHERE Id = @Id", conn);
check.Parameters.AddWithValue("@Id", productId);
Console.WriteLine($"Stock restant : {await check.ExecuteScalarAsync()}");`,
      output: `Commande validée
Stock restant : 8`,
      steps: [
        "<code>INSERT INTO Products ... OUTPUT INSERTED.Id</code> : on crée un produit de test et on récupère son Id, pour que l'exemple marche quelles que soient tes données.",
        "<code>(SqlTransaction)await conn.BeginTransactionAsync()</code> : on démarre la transaction sur la connexion ouverte. Le cast donne le type précis attendu par <code>SqlCommand</code>.",
        "<code>new SqlCommand(..., conn, tx)</code> : chacune des trois commandes reçoit la transaction en troisième argument.",
        "<code>SELECT TOP 1 Id, SYSUTCDATETIME(), 'Pending' FROM Customers</code> : un <code>INSERT ... SELECT</code> qui prend le premier client existant comme acheteur.",
        "<code>await tx.CommitAsync();</code> : les trois écritures deviennent définitives en même temps.",
        "<code>catch { await tx.RollbackAsync(); ... throw; }</code> : en cas d'erreur, on annule tout, puis <code>throw;</code> relance l'erreur pour ne pas la cacher.",
        "<code>SELECT Stock ...</code> : après le Commit, le stock vaut bien 10 - 2 = 8."
      ],
      explain: "C'est le squelette que tu réutiliseras partout : Begin, commandes avec tx, Commit dans le try, Rollback dans le catch."
    },
    {
      title: "Stock insuffisant : tout est annulé",
      code: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

// Un micro avec UNE seule pièce en stock
var create = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (N'Micro', 89.00, 1)", conn);
int productId = (int)(await create.ExecuteScalarAsync())!;
var count = new SqlCommand("SELECT COUNT(*) FROM Orders", conn);
int before = (int)(await count.ExecuteScalarAsync())!;

await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
try
{
    var order = new SqlCommand("INSERT INTO Orders (CustomerId, OrderDate, Status) SELECT TOP 1 Id, SYSUTCDATETIME(), 'Pending' FROM Customers ORDER BY Id", conn, tx);
    await order.ExecuteNonQueryAsync();
    Console.WriteLine("Commande insérée (pas encore validée)");

    // On ne retire le stock que s'il y en a assez
    var stock = new SqlCommand("UPDATE Products SET Stock = Stock - 3 WHERE Id = @Id AND Stock >= 3", conn, tx);
    stock.Parameters.AddWithValue("@Id", productId);
    int rows = await stock.ExecuteNonQueryAsync();
    if (rows == 0)
        throw new InvalidOperationException("stock insuffisant");

    await tx.CommitAsync();
}
catch (InvalidOperationException ex)
{
    await tx.RollbackAsync();
    Console.WriteLine($"Annulé : {ex.Message}");
}

int after = (int)(await count.ExecuteScalarAsync())!;
Console.WriteLine($"Nombre de commandes inchangé : {before == after}");`,
      output: `Commande insérée (pas encore validée)
Annulé : stock insuffisant
Nombre de commandes inchangé : True`,
      steps: [
        "<code>int before = ...</code> : on compte les commandes avant, pour comparer à la fin.",
        "<code>order.ExecuteNonQueryAsync()</code> : la commande est insérée <em>dans la transaction</em>. Elle existe, mais n'est pas encore validée.",
        "<code>WHERE Id = @Id AND Stock &gt;= 3</code> : vérification et modification en une seule requête. Avec 1 pièce en stock, aucune ligne ne correspond.",
        "<code>if (rows == 0) throw ...</code> : 0 ligne modifiée veut dire « refusé ». On lance une exception pour sauter dans le <code>catch</code>.",
        "<code>await tx.RollbackAsync();</code> : la commande insérée plus haut est effacée.",
        "<code>before == after</code> : le nombre de commandes n'a pas bougé, d'où <code>True</code>."
      ],
      explain: "Le Rollback efface aussi ce qui a « réussi » avant l'erreur : c'est tout l'intérêt."
    },
    {
      title: "Les deux pièges : pas de tx, pas de Commit",
      code: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

// Piège 1 : oublier de passer la transaction à la commande
await using (var tx = (SqlTransaction)await conn.BeginTransactionAsync())
{
    var insert = new SqlCommand("INSERT INTO Products (Name, Price, Stock) VALUES (N'Fantôme', 1, 1)", conn);
    try
    {
        await insert.ExecuteNonQueryAsync();
    }
    catch (InvalidOperationException)
    {
        Console.WriteLine("Erreur : la commande n'a pas reçu la transaction");
    }

    // Piège 2 : on corrige... mais on oublie CommitAsync
    insert.Transaction = tx;
    await insert.ExecuteNonQueryAsync();
    Console.WriteLine("Fantôme inséré dans la transaction");
} // fin du bloc : Dispose sans Commit = Rollback automatique

var check = new SqlCommand("SELECT COUNT(*) FROM Products WHERE Name = N'Fantôme'", conn);
Console.WriteLine($"Fantômes en base : {await check.ExecuteScalarAsync()}");`,
      output: `Erreur : la commande n'a pas reçu la transaction
Fantôme inséré dans la transaction
Fantômes en base : 0`,
      steps: [
        "<code>await using (var tx = ...) { ... }</code> : ici on utilise la forme avec bloc, pour bien voir où la transaction se termine.",
        "<code>new SqlCommand(..., conn)</code> : la commande n'a pas de transaction alors que la connexion en a une ouverte.",
        "<code>catch (InvalidOperationException)</code> : ADO.NET refuse de l'exécuter. On attrape l'erreur pour continuer la démonstration.",
        "<code>insert.Transaction = tx;</code> : on peut aussi rattacher la transaction après coup, via la propriété <code>Transaction</code>.",
        "<code>}</code> : on sort du bloc sans <code>CommitAsync()</code>. La transaction est libérée, donc annulée, sans aucun message.",
        "<code>SELECT COUNT(*) ...</code> : la preuve, aucun « Fantôme » n'est resté en base."
      ],
      explain: "Le piège 1 fait du bruit, le piège 2 est silencieux : c'est lui qu'il faut surveiller."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Annuler volontairement",
      prompt: `<p>Ouvre une connexion, démarre une transaction, insère un produit <code>"Brouillon"</code> (prix 1, stock 1) avec la transaction, puis appelle <strong>volontairement</strong> <code>RollbackAsync()</code>. Vérifie ensuite avec un <code>SELECT COUNT(*)</code> qu'aucun produit « Brouillon » n'existe.</p>`,
      hint: `<p>Le <code>SELECT COUNT(*)</code> final s'exécute après le Rollback : la transaction est terminée, la commande n'a donc plus besoin de <code>tx</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
var insert = new SqlCommand("INSERT INTO Products (Name, Price, Stock) VALUES (N'Brouillon', 1, 1)", conn, tx);
await insert.ExecuteNonQueryAsync();
await tx.RollbackAsync(); // on change d'avis

var check = new SqlCommand("SELECT COUNT(*) FROM Products WHERE Name = N'Brouillon'", conn);
Console.WriteLine($"Brouillons : {await check.ExecuteScalarAsync()}"); // 0`
    },
    {
      level: "moyen",
      title: "Déplacer du stock entre deux produits",
      prompt: `<p>Crée deux produits « Entrepôt A » (stock 10) et « Entrepôt B » (stock 0). Dans une transaction, retire 4 pièces de A (seulement si A en a au moins 4) et ajoute-les à B. Si le retrait échoue, annule tout. Affiche ensuite les deux stocks.</p>`,
      hint: `<p>Reprends <code>WHERE Id = @Id AND Stock &gt;= @Qty</code> et teste le nombre de lignes modifiées avant de faire le second <code>UPDATE</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

int a = await CreateAsync("Entrepôt A", 10);
int b = await CreateAsync("Entrepôt B", 0);

await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
try
{
    var take = new SqlCommand("UPDATE Products SET Stock = Stock - 4 WHERE Id = @Id AND Stock >= 4", conn, tx);
    take.Parameters.AddWithValue("@Id", a);
    if (await take.ExecuteNonQueryAsync() == 0)
        throw new InvalidOperationException("Pas assez de stock dans A");

    var give = new SqlCommand("UPDATE Products SET Stock = Stock + 4 WHERE Id = @Id", conn, tx);
    give.Parameters.AddWithValue("@Id", b);
    await give.ExecuteNonQueryAsync();

    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}

Console.WriteLine($"A : {await StockAsync(a)}, B : {await StockAsync(b)}"); // A : 6, B : 4

async Task<int> CreateAsync(string name, int stock)
{
    var cmd = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, 1, @Stock)", conn);
    cmd.Parameters.AddWithValue("@Name", name);
    cmd.Parameters.AddWithValue("@Stock", stock);
    return (int)(await cmd.ExecuteScalarAsync())!;
}

async Task<int> StockAsync(int id)
{
    var cmd = new SqlCommand("SELECT Stock FROM Products WHERE Id = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);
    return (int)(await cmd.ExecuteScalarAsync())!;
}`
    },
    {
      level: "difficile",
      title: "Une commande à plusieurs lignes",
      prompt: `<p>Écris une fonction <code>PlaceOrderAsync(int customerId, List&lt;(int ProductId, int Quantity)&gt; items)</code> qui, dans une seule transaction, insère la commande, puis pour <strong>chaque</strong> article retire le stock (avec la condition <code>Stock &gt;= @Qty</code>) et insère la ligne avec le prix actuel du produit. Si un seul article manque de stock, rien ne doit rester. La fonction renvoie l'Id de la commande, ou <code>null</code> si elle a été annulée.</p>`,
      hint: `<p>Pour le prix, un <code>INSERT INTO OrderLines (...) SELECT @OrderId, Id, @Qty, Price FROM Products WHERE Id = @ProductId</code> évite une lecture séparée. Un <code>try/catch (InvalidOperationException)</code> autour de la boucle renvoie <code>null</code> après le Rollback.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var first = await PlaceOrderAsync(1, [(1, 1), (2, 1)]);
Console.WriteLine(first is null ? "Annulée" : "Commande créée");
var second = await PlaceOrderAsync(1, [(1, 1), (2, 100_000)]);
Console.WriteLine(second is null ? "Annulée" : "Commande créée");

async Task<int?> PlaceOrderAsync(int customerId, List<(int ProductId, int Quantity)> items)
{
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
    try
    {
        var order = new SqlCommand("INSERT INTO Orders (CustomerId, OrderDate, Status) OUTPUT INSERTED.Id VALUES (@CustomerId, SYSUTCDATETIME(), 'Pending')", conn, tx);
        order.Parameters.AddWithValue("@CustomerId", customerId);
        int orderId = (int)(await order.ExecuteScalarAsync())!;

        foreach (var (productId, quantity) in items)
        {
            var stock = new SqlCommand("UPDATE Products SET Stock = Stock - @Qty WHERE Id = @ProductId AND Stock >= @Qty", conn, tx);
            stock.Parameters.AddWithValue("@Qty", quantity);
            stock.Parameters.AddWithValue("@ProductId", productId);
            if (await stock.ExecuteNonQueryAsync() == 0)
                throw new InvalidOperationException($"Stock insuffisant pour le produit {productId}");

            var line = new SqlCommand("INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) SELECT @OrderId, Id, @Qty, Price FROM Products WHERE Id = @ProductId", conn, tx);
            line.Parameters.AddWithValue("@OrderId", orderId);
            line.Parameters.AddWithValue("@Qty", quantity);
            line.Parameters.AddWithValue("@ProductId", productId);
            await line.ExecuteNonQueryAsync();
        }

        await tx.CommitAsync();
        return orderId;
    }
    catch (InvalidOperationException)
    {
        await tx.RollbackAsync();
        return null;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Que se passe-t-il si une transaction est libérée (fin du <code>using</code>) sans <code>CommitAsync()</code> ?`,
      options: ["Les modifications sont validées automatiquement", "Une exception est lancée", "Les modifications sont annulées, sans message"],
      answer: 2,
      why: `Une transaction non validée est annulée quand elle est libérée. C'est silencieux, d'où le piège : on croit avoir écrit, mais rien n'est resté. Il n'y a ni validation automatique ni exception.`
    },
    {
      q: `Une transaction est ouverte sur la connexion. Que fait <code>new SqlCommand(sql, conn).ExecuteNonQueryAsync()</code> (sans <code>tx</code>) ?`,
      options: ["Elle lance une <code>InvalidOperationException</code>", "Elle s'exécute hors de la transaction", "Elle rejoint la transaction toute seule"],
      answer: 0,
      why: `ADO.NET exige que chaque commande d'une connexion en transaction reçoive cette transaction. Elle ne la rejoint pas toute seule et ne s'exécute pas « à côté ».`
    },
    {
      q: `Pourquoi écrire <code>UPDATE ... SET Stock = Stock - 3 WHERE Id = @Id AND Stock &gt;= 3</code> plutôt que lire le stock puis le modifier ?`,
      options: ["Parce que c'est plus court à écrire", "Parce que la vérification et la modification se font en une seule opération, sans qu'un autre utilisateur passe entre les deux", "Parce que SELECT est interdit dans une transaction"],
      answer: 1,
      why: `Entre une lecture et une écriture séparées, un autre client peut acheter la dernière pièce. En une seule requête, SQL Server vérifie et modifie en même temps. SELECT reste tout à fait permis dans une transaction.`
    },
    {
      q: `Que signifie le « A » de ACID ?`,
      options: ["Asynchrone", "Atomique : tout ou rien", "Automatique"],
      answer: 1,
      why: `Atomique veut dire indivisible : toutes les opérations de la transaction réussissent ensemble ou sont toutes annulées.`
    }
  ],
  project: `<p><strong>OrderFlow : passer une commande pour de vrai.</strong> Dans ta console OrderFlow, ajoute une classe <code>OrderService</code> avec une méthode <code>Task&lt;int?&gt; PlaceOrderAsync(int customerId, List&lt;(int ProductId, int Quantity)&gt; items)</code> inspirée de l'exercice difficile.</p>
<ul>
<li>Ajoute au menu de la console une option « Passer une commande » qui demande l'Id du client, puis des paires produit/quantité.</li>
<li>Affiche « Commande n° X créée » ou « Commande annulée : stock insuffisant ».</li>
<li>Test : commande plus que le stock disponible d'un produit, puis vérifie avec un <code>SELECT</code> qu'aucune ligne n'a été ajoutée dans <code>Orders</code>.</li>
</ul>`,
  resources: [
    { label: "Transactions locales (ADO.NET, Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/local-transactions" },
    { label: "Classe SqlTransaction (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/microsoft.data.sqlclient.sqltransaction" }
  ]
});

// =====================================================================
// 2. Procédures stockées depuis C#
// =====================================================================
window.COURSE.push({
  key: "ado-procs",
  title: "Procédures stockées depuis C#",
  summary: "Tu sauras appeler une procédure stockée avec ADO.NET, lui passer des paramètres et récupérer ses résultats, ses paramètres de sortie et ses erreurs.",
  objectives: [
    "Comprendre ce qu'est une procédure stockée et quand elle est utile",
    "Appeler une procédure avec CommandType.StoredProcedure",
    "Lire un paramètre de sortie et une valeur de retour",
    "Attraper une erreur métier lancée par THROW avec SqlException"
  ],
  analogy: `<p>Au restaurant, tu ne vas pas en cuisine expliquer au chef chaque geste de la recette. Tu commandes « le plat du jour n° 3 », et la cuisine sait déjà quoi faire.</p>
<p>Une <strong>procédure stockée</strong>, c'est ce plat du jour : une recette SQL enregistrée <em>dans</em> la base, avec un nom. Ton code C# passe la commande avec quelques ingrédients (les paramètres), et reçoit l'assiette (le résultat).</p>`,
  lesson: `<h3>Une procédure stockée, c'est quoi ?</h3>
<p>Une <strong>procédure stockée</strong> est un bloc de SQL qui porte un nom et qui est rangé dans la base, comme une fonction. Elle peut recevoir des paramètres, lire, écrire, et même gérer sa propre transaction. On la crée une fois avec <code>CREATE PROCEDURE</code>, puis on l'appelle autant de fois qu'on veut.</p>
<p>Si tu compares avec Angular : c'est un peu comme un endpoint d'API déjà écrit côté serveur. Ton code ne connaît pas les détails, il connaît seulement le nom et les paramètres.</p>
<pre class="diagram">
  Programme C#            SQL Server
 +-------------+  nom   +--------------------+
 | SqlCommand  |-------&gt;| dbo.PlaceOrder     |
 |             | params |  UPDATE Products   |
 |             |&lt;-------|  INSERT Orders     |
 +-------------+ résult.+--------------------+
</pre>

<h3>Créer une procédure</h3>
<p>Voici la procédure <code>dbo.PlaceOrder</code> d'OrderFlow. Exécute ce script une fois dans SSMS ou Azure Data Studio (ou avec <code>sqlcmd</code>). Elle reprend la logique de la leçon précédente, mais <em>côté SQL</em> :</p>
<pre class="diagram">
CREATE OR ALTER PROCEDURE dbo.PlaceOrder
    @CustomerId int, @ProductId int,
    @Quantity int, @OrderId int OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    UPDATE Products SET Stock = Stock - @Quantity
    WHERE Id = @ProductId AND Stock &gt;= @Quantity;
    IF @@ROWCOUNT = 0
    BEGIN
        ROLLBACK;
        RETURN 1; -- stock insuffisant
    END
    INSERT INTO Orders
        (CustomerId, OrderDate, Status)
    VALUES
    (@CustomerId, SYSUTCDATETIME(), 'Pending');
    SET @OrderId = SCOPE_IDENTITY();
    INSERT INTO OrderLines
        (OrderId, ProductId, Quantity, UnitPrice)
    SELECT @OrderId, Id, @Quantity, Price
    FROM Products WHERE Id = @ProductId;
    COMMIT;
    RETURN 0; -- tout va bien
END
</pre>
<p>Quelques mots nouveaux : <code>CREATE OR ALTER</code> crée la procédure ou la remplace si elle existe. <code>SET NOCOUNT ON</code> évite d'envoyer les messages « n lignes affectées ». <code>@@ROWCOUNT</code> donne le nombre de lignes touchées par la dernière requête. <code>SCOPE_IDENTITY()</code> renvoie le dernier Id créé. <code>OUTPUT</code> marque un paramètre que la procédure remplit pour l'appelant.</p>

<h3>L'appeler depuis C#</h3>
<p>Deux changements par rapport à une requête classique : le texte de la commande est le <strong>nom</strong> de la procédure, et tu indiques <code>cmd.CommandType = CommandType.StoredProcedure</code> (l'enum <code>CommandType</code> est dans <code>System.Data</code>). Les paramètres d'entrée s'ajoutent comme d'habitude. Ensuite, tu choisis la méthode d'exécution selon ce que la procédure renvoie : <code>ExecuteReaderAsync()</code> si elle fait un <code>SELECT</code>, <code>ExecuteNonQueryAsync()</code> sinon.</p>

<h3>Trois façons de recevoir une réponse</h3>
<table>
<tr><th>Moyen</th><th>Côté SQL</th><th>Côté C#</th></tr>
<tr><td>Jeu de résultats</td><td><code>SELECT ...</code></td><td><code>ExecuteReaderAsync()</code> puis <code>ReadAsync()</code></td></tr>
<tr><td>Paramètre de sortie</td><td><code>@OrderId int OUTPUT</code></td><td><code>Direction = ParameterDirection.Output</code>, puis lire <code>.Value</code></td></tr>
<tr><td>Valeur de retour</td><td><code>RETURN 1;</code> (un int)</td><td><code>Direction = ParameterDirection.ReturnValue</code></td></tr>
</table>
<p>Un paramètre de sortie se crée avec <code>cmd.Parameters.Add("@OrderId", SqlDbType.Int)</code> : on donne son type SQL car on n'a pas de valeur à fournir. Sa valeur se lit <strong>après</strong> l'exécution. Si la procédure ne l'a pas rempli, elle vaut <code>DBNull.Value</code>, la valeur « NULL » côté .NET. La valeur de retour, elle, sert par convention de code d'état : 0 pour « OK », autre chose pour une erreur prévue.</p>

<h3>Les erreurs : THROW et SqlException</h3>
<p>Une procédure peut aussi signaler une erreur avec <code>THROW 50001, N'Message', 1;</code>. Le premier nombre est le <strong>numéro d'erreur</strong> (à partir de 50000 pour tes propres erreurs). Côté C#, cela devient une <code>SqlException</code> dont la propriété <code>Number</code> vaut 50001 et <code>Message</code> contient ton texte. Avec un filtre <code>catch (SqlException ex) when (ex.Number == 50001)</code>, tu attrapes seulement ton erreur métier et laisses passer les vraies pannes.</p>
<div class="tip">Le nom des paramètres C# doit être exactement celui de la procédure (<code>@Quantity</code>, pas <code>@Qty</code>). Sinon, SQL Server répond que la procédure attend un paramètre qui n'a pas été fourni.</div>

<h3>Procédure ou SQL dans le code ?</h3>
<div class="compare"><div><h4>Procédure stockée</h4><p>Logique proche des données, un seul aller-retour réseau, droits donnés sur la procédure seulement. Mais le code est séparé en deux endroits et plus dur à tester.</p></div><div><h4>SQL dans le C#</h4><p>Tout le code au même endroit, versionné avec l'application, facile à lire. C'est le choix le plus courant aujourd'hui, surtout avec Dapper ou EF Core.</p></div></div>
<div class="note">En entreprise, tu croiseras souvent des bases existantes pleines de procédures stockées. Savoir les appeler proprement est indispensable. Pour du code neuf, garde les procédures pour les traitements lourds qui gagnent à rester dans la base (calculs sur beaucoup de lignes, imports).</div>`,
  examples: [
    {
      title: "Appeler une procédure qui renvoie des lignes",
      code: `using System.Data;
using System.Globalization;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

// On crée (ou remplace) la procédure : à faire une seule fois
var ddl = new SqlCommand("""
    CREATE OR ALTER PROCEDURE dbo.GetProductById @Id int AS
    BEGIN
        SET NOCOUNT ON;
        SELECT Id, Name, Price, Stock FROM Products WHERE Id = @Id;
    END
    """, conn);
await ddl.ExecuteNonQueryAsync();

var create = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (N'Webcam', 39.90, 7)", conn);
int id = (int)(await create.ExecuteScalarAsync())!;

// L'appel : le nom de la procédure + CommandType.StoredProcedure
var cmd = new SqlCommand("dbo.GetProductById", conn);
cmd.CommandType = CommandType.StoredProcedure;
cmd.Parameters.AddWithValue("@Id", id);

await using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    string price = reader.GetDecimal(2).ToString(CultureInfo.InvariantCulture);
    Console.WriteLine($"{reader.GetString(1)} : {price} €, stock {reader.GetInt32(3)}");
}`,
      output: `Webcam : 39.90 €, stock 7`,
      steps: [
        "<code>new SqlCommand(\"\"\" CREATE OR ALTER PROCEDURE ... \"\"\")</code> : une chaîne brute (trois guillemets) permet d'écrire le SQL sur plusieurs lignes. On crée la procédure depuis C# pour que l'exemple soit complet.",
        "<code>INSERT ... VALUES (N'Webcam', 39.90, 7)</code> : un produit de test, dont on garde l'Id.",
        "<code>new SqlCommand(\"dbo.GetProductById\", conn)</code> : le texte de la commande est seulement le nom de la procédure.",
        "<code>cmd.CommandType = CommandType.StoredProcedure;</code> : sans cette ligne, SQL Server essaierait d'exécuter « dbo.GetProductById » comme une requête.",
        "<code>ExecuteReaderAsync()</code> : la procédure fait un <code>SELECT</code>, on lit donc ses lignes comme d'habitude.",
        "<code>ToString(CultureInfo.InvariantCulture)</code> : affiche 39.90 avec un point, quelle que soit la langue du PC."
      ]
    },
    {
      title: "Paramètre de sortie et valeur de retour",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

// Prérequis : la procédure dbo.PlaceOrder du cours existe
const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

var create = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (N'Tapis', 15.00, 5)", conn);
int productId = (int)(await create.ExecuteScalarAsync())!;
var first = new SqlCommand("SELECT TOP 1 Id FROM Customers ORDER BY Id", conn);
int customerId = (int)(await first.ExecuteScalarAsync())!;

await PlaceOrderAsync(2);   // il en reste 5 : ça passe
await PlaceOrderAsync(10);  // il en reste 3 : refusé

async Task PlaceOrderAsync(int quantity)
{
    var cmd = new SqlCommand("dbo.PlaceOrder", conn) { CommandType = CommandType.StoredProcedure };
    cmd.Parameters.AddWithValue("@CustomerId", customerId);
    cmd.Parameters.AddWithValue("@ProductId", productId);
    cmd.Parameters.AddWithValue("@Quantity", quantity);

    // Paramètre de sortie : la procédure le remplit
    var orderId = cmd.Parameters.Add("@OrderId", SqlDbType.Int);
    orderId.Direction = ParameterDirection.Output;
    // Valeur de retour : le nombre après RETURN
    var code = cmd.Parameters.Add("@ReturnValue", SqlDbType.Int);
    code.Direction = ParameterDirection.ReturnValue;

    await cmd.ExecuteNonQueryAsync();
    bool created = orderId.Value is int;
    Console.WriteLine($"Quantité {quantity} : code {code.Value}, commande créée : {created}");
}`,
      output: `Quantité 2 : code 0, commande créée : True
Quantité 10 : code 1, commande créée : False`,
      steps: [
        "<code>{ CommandType = CommandType.StoredProcedure }</code> : un initialiseur d'objet, plus court que d'écrire la propriété sur une ligne à part.",
        "<code>cmd.Parameters.Add(\"@OrderId\", SqlDbType.Int)</code> : on déclare le paramètre avec son type SQL, sans valeur, puisque c'est la procédure qui le remplit.",
        "<code>orderId.Direction = ParameterDirection.Output;</code> : on dit à ADO.NET de rapporter la valeur après l'exécution.",
        "<code>code.Direction = ParameterDirection.ReturnValue;</code> : ce paramètre reçoit le nombre du <code>RETURN</code>. Son nom n'a pas d'importance.",
        "<code>ExecuteNonQueryAsync()</code> : la procédure ne renvoie pas de lignes, seulement des paramètres.",
        "<code>orderId.Value is int</code> : au premier appel la procédure a rempli l'Id. Au second, elle a fait <code>RETURN 1</code> avant : la valeur est <code>DBNull.Value</code>, donc pas un int."
      ],
      explain: "Le code de retour dit ce qui s'est passé, le paramètre de sortie transporte la donnée créée."
    },
    {
      title: "Attraper une erreur THROW",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

var ddl = new SqlCommand("""
    CREATE OR ALTER PROCEDURE dbo.RestockProduct @ProductId int, @Quantity int AS
    BEGIN
        SET NOCOUNT ON;
        IF @Quantity <= 0
            THROW 50001, N'La quantité doit être positive.', 1;
        UPDATE Products SET Stock = Stock + @Quantity WHERE Id = @ProductId;
    END
    """, conn);
await ddl.ExecuteNonQueryAsync();

foreach (int quantity in new[] { -5, 20 })
{
    var cmd = new SqlCommand("dbo.RestockProduct", conn) { CommandType = CommandType.StoredProcedure };
    cmd.Parameters.AddWithValue("@ProductId", 1);
    cmd.Parameters.AddWithValue("@Quantity", quantity);
    try
    {
        await cmd.ExecuteNonQueryAsync();
        Console.WriteLine($"{quantity} : réassort enregistré");
    }
    catch (SqlException ex) when (ex.Number == 50001)
    {
        // Notre erreur métier, lancée par THROW dans la procédure
        Console.WriteLine($"{quantity} : refusé ({ex.Message})");
    }
}`,
      output: `-5 : refusé (La quantité doit être positive.)
20 : réassort enregistré`,
      steps: [
        "<code>THROW 50001, N'La quantité doit être positive.', 1;</code> : la procédure lance une erreur avec son propre numéro (50001) et un message. Le dernier chiffre est un « état » libre, souvent 1.",
        "<code>foreach (int quantity in new[] { -5, 20 })</code> : on appelle la procédure deux fois, avec une mauvaise puis une bonne quantité.",
        "<code>cmd.Parameters.AddWithValue(\"@ProductId\", 1);</code> : on réapprovisionne le produit n° 1 de ta base.",
        "<code>catch (SqlException ex) when (ex.Number == 50001)</code> : le filtre <code>when</code> n'attrape que notre erreur. Une autre <code>SqlException</code> (base injoignable, faute de frappe) remonterait normalement.",
        "<code>ex.Message</code> : contient exactement le texte écrit dans le <code>THROW</code>."
      ],
      explain: "Le numéro d'erreur sert de contrat entre la procédure et le C# : choisis-les et note-les quelque part."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les produits pas chers",
      prompt: `<p>Crée (depuis C# ou SSMS) une procédure <code>dbo.GetProductsUnderPrice</code> qui prend <code>@MaxPrice decimal(10,2)</code> et renvoie <code>Name</code> et <code>Price</code> des produits moins chers, triés par prix. Appelle-la depuis C# avec 50 et affiche les noms.</p>`,
      hint: `<p>N'oublie pas <code>CommandType.StoredProcedure</code>, et utilise <code>ExecuteReaderAsync()</code> puisque la procédure fait un <code>SELECT</code>.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

var ddl = new SqlCommand("""
    CREATE OR ALTER PROCEDURE dbo.GetProductsUnderPrice @MaxPrice decimal(10,2) AS
    BEGIN
        SET NOCOUNT ON;
        SELECT Name, Price FROM Products WHERE Price < @MaxPrice ORDER BY Price;
    END
    """, conn);
await ddl.ExecuteNonQueryAsync();

var cmd = new SqlCommand("dbo.GetProductsUnderPrice", conn) { CommandType = CommandType.StoredProcedure };
cmd.Parameters.AddWithValue("@MaxPrice", 50m);
await using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync())
    Console.WriteLine(reader.GetString(0));`
    },
    {
      level: "moyen",
      title: "Compter les commandes par statut",
      prompt: `<p>Écris une procédure <code>dbo.CountOrdersByStatus</code> avec un paramètre d'entrée <code>@Status nvarchar(20)</code> et un paramètre de sortie <code>@Total int OUTPUT</code>. Depuis C#, appelle-la pour <code>"Pending"</code> et affiche « Commandes Pending : N ».</p>`,
      hint: `<p>Côté SQL : <code>SELECT @Total = COUNT(*) FROM Orders WHERE Status = @Status;</code>. Côté C# : un paramètre <code>SqlDbType.Int</code> avec <code>ParameterDirection.Output</code>, lu après <code>ExecuteNonQueryAsync()</code>.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

var ddl = new SqlCommand("""
    CREATE OR ALTER PROCEDURE dbo.CountOrdersByStatus @Status nvarchar(20), @Total int OUTPUT AS
    BEGIN
        SET NOCOUNT ON;
        SELECT @Total = COUNT(*) FROM Orders WHERE Status = @Status;
    END
    """, conn);
await ddl.ExecuteNonQueryAsync();

var cmd = new SqlCommand("dbo.CountOrdersByStatus", conn) { CommandType = CommandType.StoredProcedure };
cmd.Parameters.AddWithValue("@Status", "Pending");
var total = cmd.Parameters.Add("@Total", SqlDbType.Int);
total.Direction = ParameterDirection.Output;

await cmd.ExecuteNonQueryAsync();
Console.WriteLine($"Commandes Pending : {total.Value}");`
    },
    {
      level: "difficile",
      title: "Traduire le code de retour",
      prompt: `<p>Écris une fonction <code>Task&lt;string&gt; TryPlaceOrderAsync(int customerId, int productId, int quantity)</code> qui appelle <code>dbo.PlaceOrder</code> et renvoie un message lisible : « Commande n° X créée » si le code vaut 0, « Stock insuffisant » si le code vaut 1, et « Client ou produit inconnu » si SQL Server lance une <code>SqlException</code> numéro 547 (violation de clé étrangère, par exemple un client qui n'existe pas).</p>`,
      hint: `<p>Un <code>switch</code> sur <code>(int)code.Value</code> fait l'affaire. Pour l'erreur 547 : <code>catch (SqlException ex) when (ex.Number == 547)</code>. Teste avec un client <code>-1</code>.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Console.WriteLine(await TryPlaceOrderAsync(1, 1, 1));
Console.WriteLine(await TryPlaceOrderAsync(1, 1, 1_000_000)); // Stock insuffisant
Console.WriteLine(await TryPlaceOrderAsync(-1, 1, 1));        // Client ou produit inconnu

async Task<string> TryPlaceOrderAsync(int customerId, int productId, int quantity)
{
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    var cmd = new SqlCommand("dbo.PlaceOrder", conn) { CommandType = CommandType.StoredProcedure };
    cmd.Parameters.AddWithValue("@CustomerId", customerId);
    cmd.Parameters.AddWithValue("@ProductId", productId);
    cmd.Parameters.AddWithValue("@Quantity", quantity);
    var orderId = cmd.Parameters.Add("@OrderId", SqlDbType.Int);
    orderId.Direction = ParameterDirection.Output;
    var code = cmd.Parameters.Add("@ReturnValue", SqlDbType.Int);
    code.Direction = ParameterDirection.ReturnValue;

    try
    {
        await cmd.ExecuteNonQueryAsync();
    }
    catch (SqlException ex) when (ex.Number == 547)
    {
        return "Client ou produit inconnu";
    }

    return (int)code.Value switch
    {
        0 => $"Commande n° {orderId.Value} créée",
        1 => "Stock insuffisant",
        _ => "Erreur inattendue"
    };
}`
    }
  ],
  quiz: [
    {
      q: `Que faut-il ajouter à une <code>SqlCommand</code> dont le texte est <code>"dbo.PlaceOrder"</code> ?`,
      options: ["<code>cmd.CommandType = CommandType.StoredProcedure;</code>", "Un point-virgule à la fin du nom", "Rien, ADO.NET devine tout seul"],
      answer: 0,
      why: `Par défaut, <code>CommandType</code> vaut <code>Text</code> : le texte est traité comme une requête SQL. Il faut indiquer explicitement qu'il s'agit d'une procédure stockée.`
    },
    {
      q: `Quand peut-on lire la valeur d'un paramètre de sortie ?`,
      options: ["Avant l'exécution", "Après l'exécution de la commande", "Seulement dans une transaction"],
      answer: 1,
      why: `C'est la procédure qui remplit le paramètre pendant son exécution. Avant, il est vide. Aucune transaction n'est nécessaire pour le lire.`
    },
    {
      q: `Une procédure fait <code>THROW 50001, N'Quantité invalide', 1;</code>. Que reçoit le code C# ?`,
      options: ["Un code de retour égal à 50001", "Une <code>InvalidOperationException</code>", "Une <code>SqlException</code> dont <code>Number</code> vaut 50001"],
      answer: 2,
      why: `THROW lève une erreur SQL, qu'ADO.NET transforme en <code>SqlException</code>. Le numéro choisi se retrouve dans <code>Number</code>. Le code de retour, lui, vient seulement de <code>RETURN</code>.`
    },
    {
      q: `Un paramètre de sortie que la procédure n'a pas rempli vaut...`,
      options: ["<code>0</code>", "<code>DBNull.Value</code>", "<code>null</code> en C#"],
      answer: 1,
      why: `ADO.NET représente le NULL SQL par <code>DBNull.Value</code>, pas par <code>null</code> ni par 0. C'est pour cela que l'exemple teste <code>orderId.Value is int</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : un dossier pour le SQL.</strong> Crée un fichier <code>database/02-procedures.sql</code> qui contient la procédure <code>dbo.PlaceOrder</code> de la leçon, et exécute-le sur ta base.</p>
<ul>
<li>Ajoute dans <code>OrderService</code> une seconde méthode <code>PlaceOrderWithProcAsync(customerId, productId, quantity)</code> qui appelle la procédure et traduit le code de retour (exercice difficile).</li>
<li>Dans le menu de la console, propose les deux façons de commander et vérifie qu'elles donnent le même résultat en base.</li>
<li>Note en une phrase, en commentaire, laquelle tu trouves la plus lisible et pourquoi.</li>
</ul>`,
  resources: [
    { label: "Configuration des paramètres (ADO.NET, Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/configure-parameters" },
    { label: "CREATE PROCEDURE (Transact-SQL, Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/t-sql/statements/create-procedure-transact-sql" }
  ]
});

// =====================================================================
// 3. DataTable et insertion en masse avec SqlBulkCopy
// =====================================================================
window.COURSE.push({
  key: "ado-bulk",
  title: "DataTable et insertion en masse avec SqlBulkCopy",
  summary: "Tu sauras préparer des données dans une DataTable et en envoyer des milliers d'un coup à SQL Server avec SqlBulkCopy.",
  objectives: [
    "Créer une DataTable en mémoire avec ses colonnes et ses lignes",
    "Comprendre pourquoi un INSERT par ligne est trop lent pour un import",
    "Copier des milliers de lignes avec SqlBulkCopy et suivre la progression",
    "Utiliser une table temporaire pour mettre à jour beaucoup de lignes"
  ],
  analogy: `<p>Tu déménages 500 cartons. Tu peux faire 500 allers-retours en voiture, un carton à chaque fois : c'est l'<code>INSERT</code> ligne par ligne. Ou tu loues un camion, tu charges tout, et tu fais <strong>un seul trajet</strong>.</p>
<p>La <code>DataTable</code>, c'est le camion qu'on remplit sur le trottoir. <code>SqlBulkCopy</code>, c'est le trajet unique jusqu'à la base.</p>`,
  lesson: `<h3>Le problème des imports</h3>
<p>Un fournisseur t'envoie un fichier de 10 000 produits à ajouter dans OrderFlow. Avec ce que tu connais, tu écrirais une boucle qui exécute 10 000 fois <code>INSERT INTO Products ...</code>. Ça marche, mais chaque <code>INSERT</code> est un <strong>aller-retour réseau</strong> : le programme envoie, attend la réponse, puis recommence. Même à 1 milliseconde l'aller-retour, ça fait 10 secondes d'attente, et souvent bien plus.</p>
<div class="compare"><div><h4>Une boucle d'INSERT</h4><p>10 000 requêtes, 10 000 allers-retours, chaque ligne vérifiée et journalisée séparément. Lent.</p></div><div><h4>SqlBulkCopy</h4><p>Un seul flux de données envoyé en continu, avec le même protocole que les outils d'import de SQL Server. Souvent 10 à 100 fois plus rapide.</p></div></div>

<h3>La DataTable : un tableau en mémoire</h3>
<p>Une <code>DataTable</code> (namespace <code>System.Data</code>) est une table <strong>en mémoire</strong>, avec des colonnes typées et des lignes, comme une feuille Excel. Elle existe depuis les débuts de .NET. Aujourd'hui on lit plutôt les données dans des objets C# (<code>Product</code>), mais la <code>DataTable</code> reste le format le plus simple à donner à <code>SqlBulkCopy</code>.</p>
<pre class="diagram">
 DataTable "Products"
 +---------+---------+-------+
 | Name    | Price   | Stock |
 | string  | decimal | int   |  &lt;- Columns
 +---------+---------+-------+
 | Clavier | 49.90   | 10    |  &lt;- Rows[0]
 | Souris  | 19.90   | 25    |  &lt;- Rows[1]
 +---------+---------+-------+
</pre>
<p>On déclare les colonnes avec <code>table.Columns.Add("Name", typeof(string))</code>. On ajoute une ligne avec <code>table.Rows.Add("Clavier", 49.90m, 10)</code>, les valeurs dans l'ordre des colonnes. On lit une case avec <code>row["Name"]</code> : le résultat est un <code>object</code>, qu'il faut convertir, par exemple <code>(decimal)row["Price"]</code>. La <code>DataTable</code> vérifie les types : mettre du texte dans une colonne <code>decimal</code> lance une <code>ArgumentException</code>.</p>

<h3>SqlBulkCopy en quatre réglages</h3>
<p><code>SqlBulkCopy</code> reçoit une connexion ouverte. Ensuite, tu règles :</p>
<ul>
<li><code>DestinationTableName</code> : la table de destination, par exemple <code>"dbo.Products"</code>.</li>
<li><code>ColumnMappings</code> : quelle colonne de ta <code>DataTable</code> va dans quelle colonne SQL. Sans mapping, la copie se fait <strong>par position</strong> : ta première colonne irait dans <code>Id</code>, ce qui casse tout. Mappe donc toujours par nom.</li>
<li><code>BatchSize</code> : le nombre de lignes envoyées par paquet (5 000 est un bon début).</li>
<li><code>NotifyAfter</code> et l'événement <code>SqlRowsCopied</code> : être prévenu toutes les N lignes pour afficher une progression.</li>
</ul>
<p>Puis un seul appel : <code>await bulk.WriteToServerAsync(table)</code>. La colonne <code>Id</code> n'est pas mappée : SQL Server la remplit tout seul grâce à <code>IDENTITY</code>.</p>
<div class="flow"><span>Fichier ou calcul</span><span>DataTable</span><span>SqlBulkCopy</span><span>Table SQL</span></div>

<h3>Mettre à jour en masse : la table temporaire</h3>
<p><code>SqlBulkCopy</code> sait seulement <strong>insérer</strong>. Pour mettre à jour 5 000 stocks d'un coup, on combine deux outils. D'abord, on crée une <strong>table temporaire</strong> : son nom commence par <code>#</code> et elle disparaît toute seule quand la connexion se ferme. On y copie les nouvelles valeurs avec <code>SqlBulkCopy</code>, puis une seule requête <code>UPDATE ... FROM ... JOIN</code> met à jour la vraie table.</p>
<p>Attention : la table temporaire n'existe que pour <strong>la connexion qui l'a créée</strong>. Création, copie et <code>UPDATE</code> doivent donc utiliser la même connexion ouverte.</p>
<div class="tip">Si un import doit être « tout ou rien », passe une transaction au constructeur : <code>new SqlBulkCopy(conn, SqlBulkCopyOptions.Default, tx)</code>. En cas d'erreur, un Rollback annule toutes les lignes déjà copiées.</div>
<div class="note">Par défaut, <code>SqlBulkCopy</code> ne vérifie pas les contraintes <code>CHECK</code> et les clés étrangères, et ne déclenche pas les triggers : c'est une des raisons de sa vitesse. Si tes données viennent de l'extérieur, ajoute <code>SqlBulkCopyOptions.CheckConstraints</code>, ou passe par une table temporaire et valide avant de fusionner.</div>`,
  examples: [
    {
      title: "Une DataTable en mémoire",
      code: `using System.Data;
using System.Globalization;

// Une table en mémoire, sans base de données
var table = new DataTable("Products");
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));

// Deux façons d'ajouter une ligne
table.Rows.Add("Clavier", 49.90m, 10);
DataRow row = table.NewRow();
row["Name"] = "Souris";
row["Price"] = 19.90m;
row["Stock"] = 25;
table.Rows.Add(row);

Console.WriteLine($"{table.Rows.Count} lignes, {table.Columns.Count} colonnes");
foreach (DataRow r in table.Rows)
{
    var price = (decimal)r["Price"];
    Console.WriteLine($"{r["Name"]} | {price.ToString(CultureInfo.InvariantCulture)} | {r["Stock"]}");
}

try
{
    table.Rows.Add("Écran", "pas un prix", 5); // mauvais type
}
catch (ArgumentException)
{
    Console.WriteLine("Refusé : Price attend un decimal");
}`,
      output: `2 lignes, 3 colonnes
Clavier | 49.90 | 10
Souris | 19.90 | 25
Refusé : Price attend un decimal`,
      steps: [
        "<code>table.Columns.Add(\"Price\", typeof(decimal));</code> : chaque colonne a un nom et un type. <code>typeof(decimal)</code> désigne le type lui-même.",
        "<code>table.Rows.Add(\"Clavier\", 49.90m, 10);</code> : ajout rapide, les valeurs suivent l'ordre des colonnes.",
        "<code>DataRow row = table.NewRow();</code> : ajout détaillé. On crée une ligne vide au bon format, on remplit les cases par nom, puis on l'ajoute.",
        "<code>(decimal)r[\"Price\"]</code> : une case renvoie un <code>object</code>, on la convertit dans son vrai type.",
        "<code>table.Rows.Add(\"Écran\", \"pas un prix\", 5);</code> : le texte ne peut pas devenir un decimal, la <code>DataTable</code> lance une <code>ArgumentException</code>."
      ],
      explain: "La DataTable vérifie les types dès l'ajout : les erreurs arrivent avant d'aller en base."
    },
    {
      title: "Importer 10 000 produits d'un coup",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

// 1. On prépare 10 000 produits en mémoire
var table = new DataTable();
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));
for (int i = 1; i <= 10_000; i++)
    table.Rows.Add($"Produit importé {i}", 9.99m, 100);

// 2. On les envoie en un seul flux
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();
using var bulk = new SqlBulkCopy(conn);
bulk.DestinationTableName = "dbo.Products";
bulk.BatchSize = 5_000;      // envoi par paquets de 5 000
bulk.NotifyAfter = 2_500;    // prévenir toutes les 2 500 lignes
bulk.ColumnMappings.Add("Name", "Name");
bulk.ColumnMappings.Add("Price", "Price");
bulk.ColumnMappings.Add("Stock", "Stock");
bulk.SqlRowsCopied += (sender, e) => Console.WriteLine($"{e.RowsCopied} lignes copiées...");

await bulk.WriteToServerAsync(table);
Console.WriteLine($"Terminé : {bulk.RowsCopied} lignes");`,
      output: `2500 lignes copiées...
5000 lignes copiées...
7500 lignes copiées...
10000 lignes copiées...
Terminé : 10000 lignes`,
      steps: [
        "<code>for (int i = 1; i &lt;= 10_000; i++)</code> : on fabrique 10 000 lignes. Dans la vraie vie, elles viendraient d'un fichier CSV.",
        "<code>using var bulk = new SqlBulkCopy(conn);</code> : <code>SqlBulkCopy</code> utilise la connexion ouverte et se libère avec <code>using</code>.",
        "<code>bulk.ColumnMappings.Add(\"Name\", \"Name\");</code> : colonne source, puis colonne SQL. <code>Id</code> n'est pas mappée, SQL Server la génère.",
        "<code>bulk.SqlRowsCopied += (sender, e) =&gt; ...</code> : on s'abonne à l'événement (comme un <code>subscribe</code> en Angular). Il se déclenche toutes les <code>NotifyAfter</code> lignes.",
        "<code>await bulk.WriteToServerAsync(table);</code> : tout part en un seul flux, par paquets de 5 000.",
        "<code>bulk.RowsCopied</code> : le nombre total de lignes copiées."
      ],
      explain: "Pour nettoyer ta base après le test : DELETE FROM Products WHERE Name LIKE N'Produit importé %'."
    },
    {
      title: "Réassort en masse via une table temporaire",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();

// Trois produits en rupture de stock
var ids = new List<int>();
var create = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (N'Câble USB', 5.90, 0), (N'Hub USB', 24.90, 0), (N'Chargeur', 15.90, 0)", conn);
await using (var reader = await create.ExecuteReaderAsync())
    while (await reader.ReadAsync())
        ids.Add(reader.GetInt32(0));

// 1. Une table temporaire (#) : elle vit tant que la connexion est ouverte
var temp = new SqlCommand("CREATE TABLE #Restock (ProductId int, Added int)", conn);
await temp.ExecuteNonQueryAsync();

// 2. Le fichier de réassort, ici simulé en mémoire
var table = new DataTable();
table.Columns.Add("ProductId", typeof(int));
table.Columns.Add("Added", typeof(int));
foreach (int id in ids)
    table.Rows.Add(id, 50);

using (var bulk = new SqlBulkCopy(conn) { DestinationTableName = "#Restock" })
    await bulk.WriteToServerAsync(table);

// 3. Une seule requête met tout à jour
var update = new SqlCommand("""
    UPDATE p SET p.Stock = p.Stock + r.Added
    FROM Products p JOIN #Restock r ON r.ProductId = p.Id
    """, conn);
int rows = await update.ExecuteNonQueryAsync();
Console.WriteLine($"{rows} produits réapprovisionnés");`,
      output: `3 produits réapprovisionnés`,
      steps: [
        "<code>OUTPUT INSERTED.Id VALUES (...), (...), (...)</code> : un <code>INSERT</code> de trois lignes renvoie trois Id, qu'on lit avec un reader.",
        "<code>CREATE TABLE #Restock (...)</code> : le <code>#</code> rend la table temporaire et privée à cette connexion.",
        "<code>table.Rows.Add(id, 50);</code> : chaque ligne dit « ajoute 50 pièces à tel produit ».",
        "<code>new SqlBulkCopy(conn) { DestinationTableName = \"#Restock\" }</code> : même connexion, sinon la table temporaire serait introuvable. Ici les colonnes ont le même ordre, la copie par position suffit.",
        "<code>UPDATE p SET ... FROM Products p JOIN #Restock r ...</code> : une seule requête met à jour toutes les lignes trouvées dans la table temporaire.",
        "<code>int rows = ...</code> : 3 produits ont été modifiés."
      ],
      explain: "Avec 50 000 lignes, ce schéma reste en deux allers-retours : la copie, puis l'UPDATE."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une DataTable de clients",
      prompt: `<p>Crée une <code>DataTable</code> avec deux colonnes <code>Name</code> et <code>Email</code> (string). Ajoute trois clients, puis affiche chaque email en majuscules et le nombre total de lignes.</p>`,
      hint: `<p><code>(string)row["Email"]</code> te donne une <code>string</code> sur laquelle appeler <code>ToUpperInvariant()</code>.</p>`,
      solution: `using System.Data;

var customers = new DataTable("Customers");
customers.Columns.Add("Name", typeof(string));
customers.Columns.Add("Email", typeof(string));
customers.Rows.Add("Alice", "alice@example.com");
customers.Rows.Add("Bruno", "bruno@example.com");
customers.Rows.Add("Chloé", "chloe@example.com");

foreach (DataRow row in customers.Rows)
    Console.WriteLine(((string)row["Email"]).ToUpperInvariant());
Console.WriteLine($"Total : {customers.Rows.Count}");`
    },
    {
      level: "moyen",
      title: "Importer 1 000 clients",
      prompt: `<p>Remplis une <code>DataTable</code> avec 1 000 clients (<code>Name</code>, <code>Email</code>, <code>CreatedAt</code>) puis copie-les dans <code>dbo.Customers</code> avec <code>SqlBulkCopy</code> et des mappings par nom. Les emails doivent être uniques, même si tu relances le programme. Affiche le nombre de lignes copiées.</p>`,
      hint: `<p>Pour l'unicité : <code>$"client{i}-{Guid.NewGuid():N}@example.com"</code>. Pour la date : une colonne <code>typeof(DateTime)</code> remplie avec <code>DateTime.UtcNow</code>.</p>`,
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

var table = new DataTable();
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Email", typeof(string));
table.Columns.Add("CreatedAt", typeof(DateTime));
for (int i = 1; i <= 1_000; i++)
    table.Rows.Add($"Client {i}", $"client{i}-{Guid.NewGuid():N}@example.com", DateTime.UtcNow);

await using var conn = new SqlConnection(cs);
await conn.OpenAsync();
using var bulk = new SqlBulkCopy(conn) { DestinationTableName = "dbo.Customers" };
bulk.ColumnMappings.Add("Name", "Name");
bulk.ColumnMappings.Add("Email", "Email");
bulk.ColumnMappings.Add("CreatedAt", "CreatedAt");
await bulk.WriteToServerAsync(table);
Console.WriteLine($"{bulk.RowsCopied} clients importés");`
    },
    {
      level: "difficile",
      title: "Importer un CSV en écartant les lignes invalides",
      prompt: `<p>On te donne ces lignes CSV (séparateur point-virgule) dans un tableau : <code>"Lampe;34.50;12"</code>, <code>"Tapis;quinze;5"</code>, <code>"Bureau;189.00;3"</code>, <code>"Chaise;;8"</code>. Construis une <code>DataTable</code> avec seulement les lignes valides (prix et stock lisibles), copie-la dans <code>dbo.Products</code>, puis affiche « 2 importées, 2 rejetées ».</p>`,
      hint: `<p><code>line.Split(';')</code> découpe la ligne. Pour lire le prix quelle que soit la langue du PC : <code>decimal.TryParse(parts[1], NumberStyles.Number, CultureInfo.InvariantCulture, out var price)</code>.</p>`,
      solution: `using System.Data;
using System.Globalization;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
string[] lines = ["Lampe;34.50;12", "Tapis;quinze;5", "Bureau;189.00;3", "Chaise;;8"];

var table = new DataTable();
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));
int rejected = 0;

foreach (string line in lines)
{
    string[] parts = line.Split(';');
    if (parts.Length == 3
        && decimal.TryParse(parts[1], NumberStyles.Number, CultureInfo.InvariantCulture, out decimal price)
        && int.TryParse(parts[2], out int stock))
        table.Rows.Add(parts[0], price, stock);
    else
        rejected++; // ligne illisible : on la compte et on passe
}

await using var conn = new SqlConnection(cs);
await conn.OpenAsync();
using var bulk = new SqlBulkCopy(conn) { DestinationTableName = "dbo.Products" };
bulk.ColumnMappings.Add("Name", "Name");
bulk.ColumnMappings.Add("Price", "Price");
bulk.ColumnMappings.Add("Stock", "Stock");
await bulk.WriteToServerAsync(table);
Console.WriteLine($"{table.Rows.Count} importées, {rejected} rejetées");`
    }
  ],
  quiz: [
    {
      q: `Pourquoi <code>SqlBulkCopy</code> est-il beaucoup plus rapide qu'une boucle d'<code>INSERT</code> ?`,
      options: ["Parce qu'il compresse les données", "Parce qu'il envoie toutes les lignes en un flux au lieu d'un aller-retour par ligne", "Parce qu'il ignore les colonnes decimal"],
      answer: 1,
      why: `Le coût principal d'une boucle d'INSERT, c'est l'attente réseau à chaque ligne. SqlBulkCopy envoie les lignes en continu par gros paquets. Il ne compresse rien et copie tous les types.`
    },
    {
      q: `Que se passe-t-il si tu ne définis aucun <code>ColumnMappings</code> ?`,
      options: ["La copie se fait par position des colonnes", "La copie se fait par nom automatiquement", "Une erreur de compilation"],
      answer: 0,
      why: `Sans mapping, la première colonne de la source va dans la première colonne de la table (souvent <code>Id</code>), et ainsi de suite. D'où la règle : mappe toujours par nom quand les colonnes ne sont pas strictement dans le même ordre.`
    },
    {
      q: `Combien de temps vit une table temporaire <code>#Restock</code> ?`,
      options: ["Pour toujours, comme une table normale", "Jusqu'au redémarrage de SQL Server seulement", "Tant que la connexion qui l'a créée reste ouverte"],
      answer: 2,
      why: `Une table qui commence par <code>#</code> est locale à la connexion qui l'a créée et disparaît à sa fermeture. Une autre connexion ne la voit pas.`
    },
    {
      q: `Que lance <code>table.Rows.Add("Écran", "pas un prix", 5)</code> si la colonne Price est de type <code>decimal</code> ?`,
      options: ["Rien, la valeur est mise à 0", "Une <code>ArgumentException</code>", "Une <code>SqlException</code>"],
      answer: 1,
      why: `La DataTable vérifie les types en mémoire, avant tout accès à la base. Elle n'invente pas de valeur par défaut, et il n'y a pas encore de SQL en jeu, donc pas de SqlException.`
    }
  ],
  project: `<p><strong>OrderFlow : importer un catalogue.</strong> Ajoute une classe <code>CatalogImporter</code> avec une méthode <code>Task&lt;int&gt; ImportAsync(string csvPath)</code>.</p>
<ul>
<li>Crée un fichier <code>data/products.csv</code> (<code>Name;Price;Stock</code>) avec une dizaine de lignes, dont deux volontairement fausses.</li>
<li>Lis-le avec <code>File.ReadLines(csvPath)</code>, remplis une <code>DataTable</code> comme dans l'exercice difficile et copie-la avec <code>SqlBulkCopy</code>.</li>
<li>Ajoute l'option « Importer un catalogue » au menu, qui affiche le nombre de lignes importées et rejetées.</li>
</ul>`,
  resources: [
    { label: "Opérations de copie en bloc (ADO.NET, Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/sql/connect/ado-net/sql/bulk-copy-operations-sql-server" },
    { label: "Classe SqlBulkCopy (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/microsoft.data.sqlclient.sqlbulkcopy" }
  ]
});

// =====================================================================
// 4. Ranger son code d'accès aux données : le repository
// =====================================================================
window.COURSE.push({
  key: "ado-repository",
  title: "Ranger son code d'accès aux données : le repository",
  summary: "Tu sauras regrouper tout le SQL d'une table dans une classe repository cachée derrière une interface, et tester ta logique sans base de données.",
  objectives: [
    "Comprendre le problème du SQL éparpillé dans tout le programme",
    "Écrire une interface IProductRepository et son implémentation ADO.NET",
    "Respecter les règles d'un bon repository (une connexion par méthode, null si absent)",
    "Remplacer le repository par une version en mémoire pour tester un service"
  ],
  analogy: `<p>Dans un restaurant, le serveur ne descend jamais à la cave chercher le vin. Il demande au <strong>sommelier</strong> : « une bouteille de rouge ». Le sommelier sait où tout est rangé et comment on y accède.</p>
<p>Si un jour la cave déménage, seul le sommelier doit le savoir : le serveur continue de demander « une bouteille de rouge ». Le <strong>repository</strong> est ce sommelier, et la base de données, sa cave.</p>`,
  lesson: `<h3>Le problème : du SQL partout</h3>
<p>Jusqu'ici, tu as écrit le SQL directement là où tu en avais besoin : dans le menu de la console, dans <code>OrderService</code>, dans l'import. Au bout de quelques semaines, la même requête « lire un produit par Id » existe en quatre exemplaires. Le jour où tu renommes une colonne, tu dois les retrouver tous, et tu en oublies un.</p>
<p>Il y a un second problème : pour tester une règle simple comme « peut-on commander 3 claviers ? », il faut une vraie base remplie. Les tests deviennent lents et fragiles.</p>

<h3>Le repository : un seul endroit pour le SQL</h3>
<p>Un <strong>repository</strong> (en français « dépôt ») est une classe qui regroupe tout l'accès aux données d'un type d'objet. <code>SqlProductRepository</code> contient tout le SQL de la table <code>Products</code>, et rien d'autre. Le reste du programme lui parle avec des méthodes claires : <code>GetByIdAsync(5)</code>, <code>AddAsync(product)</code>.</p>
<p>Si tu viens d'Angular, tu connais déjà le principe : un composant ne fait pas d'appel <code>HttpClient</code> lui-même, il passe par un service <code>ProductService</code>. Ici, c'est pareil avec la base de données.</p>
<pre class="diagram">
  Console / OrderService
          |
          | ne connaît que
          v
  IProductRepository (interface)
          ^
          | implémentée par
   +------+----------------+
   |                       |
 SqlProductRepository   InMemoryProductRepository
 (SQL Server)           (liste, pour les tests)
</pre>

<h3>Pourquoi une interface ?</h3>
<p>L'interface <code>IProductRepository</code> décrit <strong>ce que</strong> le repository sait faire, sans dire <strong>comment</strong>. Le code qui l'utilise dépend de l'interface, pas de SQL Server. Tu peux alors brancher une autre implémentation : une version en mémoire pour les tests, ou une version Dapper à la leçon suivante, sans toucher au code appelant.</p>
<p>C'est exactement ce que fera l'injection de dépendances d'ASP.NET Core dans la partie 4 : on lui dira « quand quelqu'un demande <code>IProductRepository</code>, donne-lui un <code>SqlProductRepository</code> ».</p>

<h3>Les règles d'un bon repository</h3>
<table>
<tr><th>Règle</th><th>Pourquoi</th></tr>
<tr><td>Une connexion par méthode, avec <code>await using</code></td><td>Ouverte tard, fermée tôt. Le pool de connexions rend l'ouverture presque gratuite.</td></tr>
<tr><td>Async partout</td><td>Le programme n'est pas bloqué pendant que la base travaille.</td></tr>
<tr><td>Toujours des paramètres SQL</td><td>Jamais de concaténation, donc pas d'injection SQL.</td></tr>
<tr><td>Renvoyer <code>null</code> si rien n'est trouvé</td><td>Le type <code>Task&lt;Product?&gt;</code> dit clairement « peut-être absent ».</td></tr>
<tr><td>Pas de logique métier</td><td>Le repository lit et écrit. Décider si on peut commander, c'est le rôle d'un service.</td></tr>
</table>
<div class="compare"><div><h4>Repository</h4><p>« Comment » lire et écrire : SQL, connexions, conversion des lignes en objets.</p></div><div><h4>Service</h4><p>« Quoi » faire : les règles métier (stock suffisant, client valide), en appelant un ou plusieurs repositories.</p></div></div>
<div class="tip">Le repository renvoie des objets C# (<code>Product</code>), jamais un <code>SqlDataReader</code> ou une <code>DataTable</code>. Si un type de <code>Microsoft.Data.SqlClient</code> apparaît dans l'interface, l'abstraction fuit.</div>

<h3>Tester sans base de données</h3>
<p>Comme le service ne connaît que l'interface, tu peux lui donner un <code>InMemoryProductRepository</code> qui range les produits dans une simple <code>List&lt;Product&gt;</code>. Le test tourne en quelques millisecondes, sans SQL Server. On appelle ça un <strong>fake</strong> (une fausse implémentation). Dans la partie 5, tu feras la même chose avec xUnit et NSubstitute.</p>
<div class="note">Ne crée pas une interface pour chaque classe « par principe ». Ici elle est justifiée : on a déjà deux implémentations (SQL et mémoire), bientôt trois avec Dapper. Une interface qui n'aura jamais qu'une seule implémentation est souvent du code en trop.</div>`,
  examples: [
    {
      title: "IProductRepository et sa version ADO.NET",
      code: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
IProductRepository repo = new SqlProductRepository(cs);
int id = await repo.AddAsync(new Product(0, "Lampe", 34.50m, 12));
Product? lamp = await repo.GetByIdAsync(id);
Console.WriteLine(lamp is null ? "Introuvable" : $"{lamp.Name}, stock {lamp.Stock}");
Console.WriteLine(await repo.GetByIdAsync(-1) is null ? "Id -1 : introuvable" : "Id -1 : trouvé");
public record Product(int Id, string Name, decimal Price, int Stock);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<int> AddAsync(Product product);
}

public class SqlProductRepository(string connectionString) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(int id)
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("SELECT Id, Name, Price, Stock FROM Products WHERE Id = @Id", conn);
        cmd.Parameters.AddWithValue("@Id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;
        return new Product(reader.GetInt32(0), reader.GetString(1), reader.GetDecimal(2), reader.GetInt32(3));
    }

    public async Task<int> AddAsync(Product product)
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, @Price, @Stock)", conn);
        cmd.Parameters.AddWithValue("@Name", product.Name);
        cmd.Parameters.AddWithValue("@Price", product.Price);
        cmd.Parameters.AddWithValue("@Stock", product.Stock);
        return (int)(await cmd.ExecuteScalarAsync())!;
    }
}`,
      output: `Lampe, stock 12
Id -1 : introuvable`,
      steps: [
        "<code>IProductRepository repo = new SqlProductRepository(cs);</code> : la variable est typée par l'interface. La suite du code ne sait pas qu'il y a du SQL derrière.",
        "<code>public record Product(...)</code> : un record simple pour transporter un produit. <code>Id</code> vaut 0 tant que la base ne l'a pas attribué.",
        "<code>public interface IProductRepository</code> : le contrat, deux méthodes async. <code>Task&lt;Product?&gt;</code> annonce que le produit peut être absent.",
        "<code>class SqlProductRepository(string connectionString)</code> : un constructeur principal. <code>connectionString</code> est utilisable dans toutes les méthodes de la classe.",
        "<code>if (!await reader.ReadAsync()) return null;</code> : aucune ligne, donc pas de produit : on renvoie <code>null</code> au lieu de lancer une exception.",
        "<code>OUTPUT INSERTED.Id</code> + <code>ExecuteScalarAsync()</code> : <code>AddAsync</code> renvoie l'Id créé par la base."
      ],
      explain: "Tout le SQL de Products tient maintenant dans une seule classe."
    },
    {
      title: "Un service testé avec un faux repository",
      code: `// Aucune base de données ici : le repository est remplacé par une version en mémoire
var repo = new InMemoryProductRepository();
await repo.AddAsync(new Product(1, "Clavier", 49.90m, 10));
await repo.AddAsync(new Product(2, "Souris", 19.90m, 0));
var service = new StockService(repo);
Console.WriteLine($"3 claviers : {await service.CanOrderAsync(1, 3)}");
Console.WriteLine($"1 souris : {await service.CanOrderAsync(2, 1)}");
Console.WriteLine($"Produit 99 : {await service.CanOrderAsync(99, 1)}");

// Le service ne connaît que l'interface, pas SQL Server
public class StockService(IProductRepository products)
{
    public async Task<bool> CanOrderAsync(int productId, int quantity)
    {
        Product? product = await products.GetByIdAsync(productId);
        return product is not null && product.Stock >= quantity;
    }
}

public class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _items = [];

    public Task<Product?> GetByIdAsync(int id) =>
        Task.FromResult(_items.FirstOrDefault(p => p.Id == id));

    public Task<int> AddAsync(Product product)
    {
        _items.Add(product);
        return Task.FromResult(product.Id);
    }
}

public record Product(int Id, string Name, decimal Price, int Stock);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<int> AddAsync(Product product);
}`,
      output: `3 claviers : True
1 souris : False
Produit 99 : False`,
      steps: [
        "<code>class StockService(IProductRepository products)</code> : le service reçoit l'interface dans son constructeur. Il ne sait pas d'où viennent les produits.",
        "<code>product is not null &amp;&amp; product.Stock &gt;= quantity</code> : la règle métier vit dans le service, pas dans le repository.",
        "<code>class InMemoryProductRepository : IProductRepository</code> : une deuxième implémentation, qui range les produits dans une liste.",
        "<code>Task.FromResult(...)</code> : fabrique une <code>Task</code> déjà terminée. Pratique quand une méthode doit être async par contrat mais n'attend rien.",
        "<code>new StockService(repo)</code> : on donne le faux repository au vrai service. Les trois cas (assez, pas assez, inconnu) sont vérifiés en quelques millisecondes."
      ],
      explain: "Le même StockService marchera avec SqlProductRepository en production, sans changer une ligne."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter les produits",
      prompt: `<p>Ajoute à <code>IProductRepository</code> une méthode <code>Task&lt;int&gt; CountAsync()</code>, puis implémente-la dans <code>SqlProductRepository</code> avec un <code>SELECT COUNT(*)</code>. Affiche le résultat dans <code>Program.cs</code>.</p>`,
      hint: `<p>Même schéma que les autres méthodes : connexion, commande, puis <code>(int)(await cmd.ExecuteScalarAsync())!</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
IProductRepository repo = new SqlProductRepository(cs);
Console.WriteLine($"Produits en base : {await repo.CountAsync()}");

public interface IProductRepository
{
    Task<int> CountAsync();
}

public class SqlProductRepository(string connectionString) : IProductRepository
{
    public async Task<int> CountAsync()
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("SELECT COUNT(*) FROM Products", conn);
        return (int)(await cmd.ExecuteScalarAsync())!;
    }
}`
    },
    {
      level: "moyen",
      title: "Les produits presque épuisés",
      prompt: `<p>Ajoute une méthode <code>Task&lt;List&lt;Product&gt;&gt; GetLowStockAsync(int threshold)</code> qui renvoie les produits dont le stock est strictement inférieur au seuil, triés par stock croissant. Affiche-les avec un seuil de 5.</p>`,
      hint: `<p>Crée une <code>List&lt;Product&gt;</code> vide, puis ajoute un <code>new Product(...)</code> à chaque tour de <code>while (await reader.ReadAsync())</code>.</p>`,
      solution: `using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
var repo = new SqlProductRepository(cs);
foreach (var p in await repo.GetLowStockAsync(5))
    Console.WriteLine($"{p.Name} : {p.Stock}");

public record Product(int Id, string Name, decimal Price, int Stock);

public class SqlProductRepository(string connectionString)
{
    public async Task<List<Product>> GetLowStockAsync(int threshold)
    {
        var result = new List<Product>();
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("SELECT Id, Name, Price, Stock FROM Products WHERE Stock < @Threshold ORDER BY Stock", conn);
        cmd.Parameters.AddWithValue("@Threshold", threshold);
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            result.Add(new Product(reader.GetInt32(0), reader.GetString(1), reader.GetDecimal(2), reader.GetInt32(3)));
        return result;
    }
}`
    },
    {
      level: "difficile",
      title: "Inscrire un client sans doublon",
      prompt: `<p>Crée un record <code>Customer(int Id, string Name, string Email)</code>, une interface <code>ICustomerRepository</code> avec <code>GetByEmailAsync(string email)</code> et <code>AddAsync(Customer customer)</code>, puis un <code>CustomerService</code> avec <code>Task&lt;bool&gt; RegisterAsync(string name, string email)</code> qui refuse un email déjà utilisé. Teste le service avec un <code>InMemoryCustomerRepository</code> : la première inscription réussit, la seconde avec le même email échoue.</p>`,
      hint: `<p>Dans le fake, compare les emails avec <code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code>. Le service appelle <code>GetByEmailAsync</code> avant <code>AddAsync</code>.</p>`,
      solution: `var service = new CustomerService(new InMemoryCustomerRepository());
Console.WriteLine(await service.RegisterAsync("Alice", "alice@example.com")); // True
Console.WriteLine(await service.RegisterAsync("Alice bis", "ALICE@example.com")); // False

public record Customer(int Id, string Name, string Email);

public interface ICustomerRepository
{
    Task<Customer?> GetByEmailAsync(string email);
    Task<int> AddAsync(Customer customer);
}

public class CustomerService(ICustomerRepository customers)
{
    public async Task<bool> RegisterAsync(string name, string email)
    {
        if (await customers.GetByEmailAsync(email) is not null)
            return false; // email déjà pris
        await customers.AddAsync(new Customer(0, name, email));
        return true;
    }
}

public class InMemoryCustomerRepository : ICustomerRepository
{
    private readonly List<Customer> _items = [];

    public Task<Customer?> GetByEmailAsync(string email) =>
        Task.FromResult(_items.FirstOrDefault(c => string.Equals(c.Email, email, StringComparison.OrdinalIgnoreCase)));

    public Task<int> AddAsync(Customer customer)
    {
        var saved = customer with { Id = _items.Count + 1 };
        _items.Add(saved);
        return Task.FromResult(saved.Id);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Quel est le rôle principal d'un repository ?`,
      options: ["Décider si une commande est autorisée", "Regrouper au même endroit le code qui lit et écrit un type de données", "Afficher les produits dans la console"],
      answer: 1,
      why: `Le repository s'occupe du « comment » accéder aux données. Les règles métier (autoriser une commande) vont dans un service, l'affichage dans l'interface utilisateur.`
    },
    {
      q: `Pourquoi le service dépend-il de <code>IProductRepository</code> plutôt que de <code>SqlProductRepository</code> ?`,
      options: ["Pour pouvoir lui donner une autre implémentation, par exemple en mémoire pour les tests", "Parce qu'une classe ne peut pas être passée en paramètre", "Pour que le code soit plus rapide"],
      answer: 0,
      why: `L'interface rend l'implémentation remplaçable : SQL en production, liste en mémoire dans les tests, Dapper demain. Les performances ne changent pas, et on peut tout à fait passer une classe en paramètre.`
    },
    {
      q: `Que doit renvoyer <code>GetByIdAsync</code> quand l'Id n'existe pas ?`,
      options: ["Un <code>Product</code> vide avec Id = 0", "Une exception <code>SqlException</code>", "<code>null</code>, annoncé par le type <code>Task&lt;Product?&gt;</code>"],
      answer: 2,
      why: `« Pas trouvé » est un cas normal, pas une erreur. <code>null</code> avec un type nullable oblige l'appelant à le gérer. Un faux produit vide serait trompeur.`
    },
    {
      q: `Laquelle de ces signatures fait « fuir » l'abstraction du repository ?`,
      options: ["<code>Task&lt;List&lt;Product&gt;&gt; GetAllAsync()</code>", "<code>Task&lt;SqlDataReader&gt; GetAllAsync()</code>", "<code>Task&lt;int&gt; CountAsync()</code>"],
      answer: 1,
      why: `Renvoyer un <code>SqlDataReader</code> oblige l'appelant à connaître ADO.NET et SQL Server, et à gérer la connexion. Un repository renvoie des objets C# simples.`
    }
  ],
  project: `<p><strong>OrderFlow : ranger le SQL.</strong> Crée un dossier <code>Data</code> dans ta console.</p>
<ul>
<li>Déplace-y <code>IProductRepository</code> et <code>SqlProductRepository</code> avec les méthodes <code>GetByIdAsync</code>, <code>GetAllAsync</code>, <code>AddAsync</code> et <code>UpdateStockAsync(int id, int newStock)</code>.</li>
<li>Fais pareil pour les clients avec <code>ICustomerRepository</code>.</li>
<li>Dans <code>Program.cs</code> et <code>OrderService</code>, remplace tous les <code>new SqlCommand</code> concernant ces tables par des appels aux repositories. But : plus aucun SQL sur <code>Products</code> ou <code>Customers</code> en dehors du dossier <code>Data</code>.</li>
</ul>`,
  resources: [
    { label: "Concevoir la couche de persistance (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design" }
  ]
});

// =====================================================================
// 5. Dapper : ADO.NET sans la corvée
// =====================================================================
window.COURSE.push({
  key: "ado-dapper",
  title: "Dapper : ADO.NET sans la corvée",
  summary: "Tu sauras utiliser Dapper pour lire et écrire en une ligne, avec des paramètres sûrs, et réécrire ton repository en deux fois moins de code.",
  objectives: [
    "Installer Dapper et comprendre ce qu'il fait à ta place",
    "Lire avec QueryAsync et QuerySingleOrDefaultAsync",
    "Écrire avec ExecuteAsync et ExecuteScalarAsync, paramètres compris",
    "Utiliser une transaction et une liste IN avec Dapper"
  ],
  analogy: `<p>Avec ADO.NET, tu fais tes courses toi-même : tu prends un panier, tu cherches chaque article, tu passes en caisse, tu ranges tout dans le frigo.</p>
<p>Dapper, c'est le <strong>service de livraison</strong> : tu donnes ta liste (la requête SQL) et on te dépose les courses déjà rangées (des objets C#). Le magasin est le même, les produits aussi : tu gagnes seulement les gestes répétitifs.</p>`,
  lesson: `<h3>La corvée d'ADO.NET</h3>
<p>Regarde la méthode <code>GetByIdAsync</code> de la leçon précédente : ouvrir la connexion, créer la commande, ajouter les paramètres un par un, lancer le reader, tester <code>ReadAsync()</code>, puis recopier chaque colonne avec <code>GetInt32(0)</code>, <code>GetString(1)</code>... Une dizaine de lignes, dont une seule contient vraiment de l'information : la requête SQL.</p>
<p><strong>Dapper</strong> est une petite bibliothèque, créée par l'équipe de Stack Overflow, qui fait ce travail répétitif à ta place. Tu écris toujours ton SQL toi-même, mais Dapper s'occupe des paramètres, de l'exécution et de la conversion des lignes en objets.</p>

<h3>Comment ça marche</h3>
<p>On l'installe avec <code>dotnet add package Dapper</code>. Dapper ajoute des <strong>méthodes d'extension</strong> à toute connexion : avec <code>using Dapper;</code>, ta <code>SqlConnection</code> gagne des méthodes comme <code>QueryAsync</code>. Une méthode d'extension, c'est une méthode « collée » de l'extérieur sur un type existant, comme si elle en faisait partie.</p>
<pre class="diagram">
 SQL + objet de paramètres
          |
          v
 conn.QueryAsync&lt;Product&gt;(sql, new { Id = 5 })
          |
          |  1. crée les paramètres @Id
          |  2. ouvre la connexion si besoin
          |  3. exécute et lit les lignes
          |  4. colonne Name -&gt; propriété Name
          v
 IEnumerable&lt;Product&gt;
</pre>
<p>Pour les paramètres, tu passes un <strong>objet anonyme</strong> : <code>new { Id = 5 }</code>. Chaque propriété devient un paramètre SQL du même nom (<code>@Id</code>). C'est toujours une requête paramétrée : aucun risque d'injection SQL. Pour la lecture, Dapper associe chaque colonne à la propriété (ou au paramètre du constructeur d'un record) qui porte le même nom.</p>

<h3>Les méthodes à connaître</h3>
<table>
<tr><th>Méthode</th><th>Renvoie</th><th>Pour</th></tr>
<tr><td><code>QueryAsync&lt;T&gt;</code></td><td>une liste de <code>T</code></td><td>Plusieurs lignes</td></tr>
<tr><td><code>QuerySingleOrDefaultAsync&lt;T&gt;</code></td><td>un <code>T</code> ou <code>null</code></td><td>Zéro ou une ligne (recherche par Id)</td></tr>
<tr><td><code>QueryFirstOrDefaultAsync&lt;T&gt;</code></td><td>le premier <code>T</code> ou <code>null</code></td><td>Prendre la première ligne d'un résultat</td></tr>
<tr><td><code>ExecuteAsync</code></td><td>le nombre de lignes touchées</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td></tr>
<tr><td><code>ExecuteScalarAsync&lt;T&gt;</code></td><td>une seule valeur</td><td><code>COUNT(*)</code>, Id créé avec <code>OUTPUT</code></td></tr>
</table>
<p>Petit détail pratique : si la connexion est fermée, Dapper l'ouvre et la referme tout seul. Tu peux donc te passer de <code>OpenAsync()</code>, sauf quand tu as besoin d'une connexion ouverte, par exemple pour démarrer une transaction.</p>

<h3>Transactions et listes</h3>
<p>Les transactions de la première leçon fonctionnent toujours : chaque méthode Dapper accepte un paramètre <code>transaction</code>. Tu ouvres la connexion, tu démarres la transaction, tu la passes à chaque appel, puis tu fais <code>CommitAsync()</code>.</p>
<p>Deux raccourcis bien pratiques. Si tu passes une <strong>liste d'objets</strong> à <code>ExecuteAsync</code>, Dapper exécute la requête une fois par élément. Et si un paramètre est un tableau, <code>WHERE Name IN @Names</code> est automatiquement transformé en liste de paramètres.</p>
<div class="tip">Les noms comptent : la colonne SQL <code>Price</code> remplit la propriété <code>Price</code>. Si une colonne s'appelle autrement, renomme-la dans le SQL avec un alias : <code>SELECT ProductName AS Name</code>. Avec un record positionnel, les types doivent aussi correspondre exactement (<code>int</code>, <code>decimal</code>...).</div>

<h3>ADO.NET, Dapper ou EF Core ?</h3>
<div class="compare"><div><h4>Dapper</h4><p>Tu écris le SQL, Dapper fait le reste. Presque aussi rapide qu'ADO.NET, très peu de code. Idéal pour les lectures et les requêtes que tu veux maîtriser.</p></div><div><h4>EF Core (partie 3)</h4><p>Tu écris du C# (LINQ), EF Core génère le SQL et suit les modifications de tes objets. Plus de confort, un peu moins de contrôle.</p></div></div>
<p>ADO.NET pur reste utile pour les cas spéciaux (<code>SqlBulkCopy</code>, lecture en flux de millions de lignes). Et Dapper n'est pas un « mini-EF » : il ne génère aucun SQL et ne suit pas les modifications de tes objets.</p>
<div class="note">Beaucoup d'équipes mélangent les deux : EF Core pour les écritures et les règles métier, Dapper pour les écrans de recherche et les rapports où le SQL doit être précis. Les deux partagent la même chaîne de connexion sans problème.</div>`,
  examples: [
    {
      title: "Lire et écrire en une ligne",
      code: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs); // pas d'OpenAsync : Dapper ouvre et referme

// Écrire : les propriétés de l'objet anonyme deviennent @Name, @Price, @Stock
int id = await conn.ExecuteScalarAsync<int>(
    "INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, @Price, @Stock)",
    new { Name = "Enceinte", Price = 79.00m, Stock = 6 });

// Lire une ligne : Dapper remplit le record tout seul
Product? speaker = await conn.QuerySingleOrDefaultAsync<Product>(
    "SELECT Id, Name, Price, Stock FROM Products WHERE Id = @Id", new { Id = id });
Console.WriteLine($"{speaker?.Name} : {speaker?.Stock} en stock");

// Aucune ligne : on obtient null, pas d'exception
Product? none = await conn.QuerySingleOrDefaultAsync<Product>(
    "SELECT Id, Name, Price, Stock FROM Products WHERE Id = @Id", new { Id = -1 });
Console.WriteLine(none is null ? "Id -1 : introuvable" : "Id -1 : trouvé");

// Plusieurs lignes : une liste de records
var cheap = await conn.QueryAsync<Product>(
    "SELECT Id, Name, Price, Stock FROM Products WHERE Price < @Max", new { Max = 100m });
Console.WriteLine($"Produits à moins de 100 € : {cheap.Count() > 0}");

public record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `Enceinte : 6 en stock
Id -1 : introuvable
Produits à moins de 100 € : True`,
      steps: [
        "<code>using Dapper;</code> : rend visibles les méthodes d'extension de Dapper sur <code>conn</code>.",
        "<code>ExecuteScalarAsync&lt;int&gt;(sql, new { Name = ..., Price = ..., Stock = ... })</code> : trois paramètres créés d'un coup, et l'Id renvoyé directement en <code>int</code>, sans cast.",
        "<code>QuerySingleOrDefaultAsync&lt;Product&gt;(...)</code> : Dapper lit la ligne et appelle le constructeur du record avec les colonnes Id, Name, Price, Stock.",
        "<code>new { Id = -1 }</code> : aucun produit, la méthode renvoie <code>null</code>.",
        "<code>QueryAsync&lt;Product&gt;(...)</code> : renvoie une collection de <code>Product</code>, une par ligne. <code>Count()</code> vient de LINQ.",
        "<code>public record Product(...)</code> : les noms et les types du record correspondent exactement aux colonnes SQL."
      ],
      explain: "Compare avec la leçon précédente : plus de reader, plus de GetInt32, plus de Parameters.AddWithValue."
    },
    {
      title: "Transaction, insertion multiple et IN",
      code: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);
await conn.OpenAsync(); // obligatoire avant BeginTransactionAsync
await using var tx = await conn.BeginTransactionAsync();

// Une liste d'objets : Dapper exécute l'INSERT une fois par élément
var newProducts = new[]
{
    new { Name = "Stylet", Price = 12.00m, Stock = 30 },
    new { Name = "Tablette", Price = 249.00m, Stock = 4 },
    new { Name = "Housse", Price = 19.00m, Stock = 15 }
};
int inserted = await conn.ExecuteAsync(
    "INSERT INTO Products (Name, Price, Stock) VALUES (@Name, @Price, @Stock)",
    newProducts, tx);
Console.WriteLine($"{inserted} produits insérés");

// IN @Names : Dapper déplie le tableau en une liste de paramètres
string[] names = ["Stylet", "Tablette", "Housse"];
var found = await conn.QueryAsync<string>(
    "SELECT DISTINCT Name FROM Products WHERE Name IN @Names ORDER BY Name",
    new { Names = names }, tx);
Console.WriteLine(string.Join(", ", found));

await tx.CommitAsync();`,
      output: `3 produits insérés
Housse, Stylet, Tablette`,
      steps: [
        "<code>await conn.OpenAsync();</code> : ici on ouvre nous-mêmes, car une transaction a besoin d'une connexion déjà ouverte.",
        "<code>await conn.BeginTransactionAsync()</code> : avec Dapper, pas besoin de cast en <code>SqlTransaction</code>, il accepte n'importe quelle transaction.",
        "<code>conn.ExecuteAsync(sql, newProducts, tx)</code> : un tableau de trois objets, donc trois <code>INSERT</code>. La valeur renvoyée additionne les lignes touchées : 3.",
        "<code>WHERE Name IN @Names</code> : sans parenthèses ! Dapper réécrit la requête en <code>IN (@Names1, @Names2, @Names3)</code>.",
        "<code>QueryAsync&lt;string&gt;</code> : quand on lit une seule colonne, on peut demander directement des <code>string</code>.",
        "<code>await tx.CommitAsync();</code> : rien n'est définitif avant cette ligne. Sans elle, les trois produits seraient annulés."
      ],
      explain: "DISTINCT évite les doublons si tu relances l'exemple plusieurs fois."
    },
    {
      title: "Le repository réécrit avec Dapper",
      code: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
IProductRepository repo = new DapperProductRepository(cs); // seule ligne changée

int id = await repo.AddAsync(new Product(0, "Lampe", 34.50m, 12));
Product? lamp = await repo.GetByIdAsync(id);
Console.WriteLine(lamp is null ? "Introuvable" : $"{lamp.Name}, stock {lamp.Stock}");
Console.WriteLine(await repo.GetByIdAsync(-1) is null ? "Id -1 : introuvable" : "Id -1 : trouvé");

public class DapperProductRepository(string connectionString) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(int id)
    {
        await using var conn = new SqlConnection(connectionString);
        return await conn.QuerySingleOrDefaultAsync<Product>(
            "SELECT Id, Name, Price, Stock FROM Products WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddAsync(Product product)
    {
        await using var conn = new SqlConnection(connectionString);
        // Le record sert lui-même de paramètres : @Name, @Price, @Stock
        return await conn.ExecuteScalarAsync<int>(
            "INSERT INTO Products (Name, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, @Price, @Stock)",
            product);
    }
}

public record Product(int Id, string Name, decimal Price, int Stock);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<int> AddAsync(Product product);
}`,
      output: `Lampe, stock 12
Id -1 : introuvable`,
      steps: [
        "<code>IProductRepository repo = new DapperProductRepository(cs);</code> : le code appelant est identique à celui de la leçon précédente. Seule l'implémentation change.",
        "<code>GetByIdAsync</code> : deux lignes au lieu de huit. Toujours une connexion par méthode, toujours <code>null</code> si absent.",
        "<code>ExecuteScalarAsync&lt;int&gt;(sql, product)</code> : on passe le record lui-même. Dapper prend <code>Name</code>, <code>Price</code> et <code>Stock</code>, et ignore <code>Id</code> qui n'apparaît pas dans le SQL.",
        "<code>public interface IProductRepository</code> : la même interface qu'avant. C'est elle qui permet de changer d'implémentation sans rien casser.",
        "Même sortie qu'avec ADO.NET : preuve que le comportement est identique."
      ],
      explain: "C'est la promesse du repository tenue : on a changé de technique d'accès aux données sans toucher au reste du programme."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les stocks faibles avec Dapper",
      prompt: `<p>Avec Dapper, lis les produits dont le stock est inférieur à 5, triés par stock croissant, et affiche « Nom : stock » pour chacun. Le seuil doit passer par un paramètre.</p>`,
      hint: `<p><code>await conn.QueryAsync&lt;Product&gt;("... WHERE Stock &lt; @Max ORDER BY Stock", new { Max = 5 })</code>.</p>`,
      solution: `using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);

var low = await conn.QueryAsync<Product>(
    "SELECT Id, Name, Price, Stock FROM Products WHERE Stock < @Max ORDER BY Stock",
    new { Max = 5 });
foreach (var p in low)
    Console.WriteLine($"{p.Name} : {p.Stock}");

public record Product(int Id, string Name, decimal Price, int Stock);`
    },
    {
      level: "moyen",
      title: "Changer un prix",
      prompt: `<p>Écris une fonction <code>Task&lt;bool&gt; UpdatePriceAsync(int id, decimal newPrice)</code> qui utilise <code>ExecuteAsync</code> et renvoie <code>true</code> seulement si une ligne a été modifiée. Teste-la avec un Id existant puis avec <code>-1</code>.</p>`,
      hint: `<p><code>ExecuteAsync</code> renvoie le nombre de lignes touchées : compare-le à 1.</p>`,
      solution: `using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

Console.WriteLine(await UpdatePriceAsync(1, 44.90m)); // True
Console.WriteLine(await UpdatePriceAsync(-1, 10m));   // False

async Task<bool> UpdatePriceAsync(int id, decimal newPrice)
{
    await using var conn = new SqlConnection(cs);
    int rows = await conn.ExecuteAsync(
        "UPDATE Products SET Price = @Price WHERE Id = @Id",
        new { Id = id, Price = newPrice });
    return rows == 1;
}`
    },
    {
      level: "difficile",
      title: "Créer une commande complète avec Dapper",
      prompt: `<p>Écris <code>Task&lt;int&gt; CreateOrderAsync(int customerId, List&lt;OrderLine&gt; lines)</code> avec Dapper, dans une transaction : insère la commande (statut <code>Pending</code>) et récupère son Id avec <code>ExecuteScalarAsync&lt;int&gt;</code>, puis insère <strong>toutes</strong> les lignes avec un seul appel à <code>ExecuteAsync</code> en lui passant une liste. Valide et renvoie l'Id. Le record est <code>OrderLine(int ProductId, int Quantity, decimal UnitPrice)</code>.</p>`,
      hint: `<p>Les lignes n'ont pas encore l'Id de la commande : construis une liste d'objets anonymes avec LINQ, <code>lines.Select(l =&gt; new { OrderId = orderId, l.ProductId, l.Quantity, l.UnitPrice })</code>.</p>`,
      solution: `using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";

int orderId = await CreateOrderAsync(1, [new OrderLine(1, 2, 49.90m), new OrderLine(2, 1, 19.90m)]);
Console.WriteLine($"Commande {orderId} créée");

async Task<int> CreateOrderAsync(int customerId, List<OrderLine> lines)
{
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    await using var tx = await conn.BeginTransactionAsync();

    int id = await conn.ExecuteScalarAsync<int>(
        "INSERT INTO Orders (CustomerId, OrderDate, Status) OUTPUT INSERTED.Id VALUES (@CustomerId, SYSUTCDATETIME(), 'Pending')",
        new { CustomerId = customerId }, tx);

    var rows = lines.Select(l => new { OrderId = id, l.ProductId, l.Quantity, l.UnitPrice });
    await conn.ExecuteAsync(
        "INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES (@OrderId, @ProductId, @Quantity, @UnitPrice)",
        rows, tx);

    await tx.CommitAsync();
    return id;
}

public record OrderLine(int ProductId, int Quantity, decimal UnitPrice);`
    }
  ],
  quiz: [
    {
      q: `Dans <code>conn.QueryAsync&lt;Product&gt;("... WHERE Id = @Id", new { Id = 5 })</code>, à quoi sert <code>new { Id = 5 }</code> ?`,
      options: ["À créer un paramètre SQL <code>@Id</code> qui vaut 5", "À remplacer le texte <code>@Id</code> par 5 dans la chaîne SQL", "À filtrer les résultats en C# après la requête"],
      answer: 0,
      why: `Chaque propriété de l'objet anonyme devient un vrai paramètre SQL. Dapper ne colle jamais la valeur dans le texte : c'est pour ça qu'il protège de l'injection SQL. Le filtre est fait par SQL Server, pas en C#.`
    },
    {
      q: `Quelle méthode Dapper choisir pour un <code>UPDATE</code> dont tu veux connaître le nombre de lignes modifiées ?`,
      options: ["<code>QueryAsync</code>", "<code>QuerySingleOrDefaultAsync</code>", "<code>ExecuteAsync</code>"],
      answer: 2,
      why: `<code>ExecuteAsync</code> exécute une requête qui ne renvoie pas de lignes et donne le nombre de lignes touchées. Les méthodes <code>Query...</code> servent à lire des résultats.`
    },
    {
      q: `Comment Dapper sait-il quelle colonne va dans quelle propriété de <code>Product</code> ?`,
      options: ["Par l'ordre des propriétés uniquement", "Par le nom : la colonne <code>Name</code> remplit <code>Name</code>", "Grâce à un fichier de configuration"],
      answer: 1,
      why: `Dapper associe par nom. Si les noms diffèrent, on utilise un alias SQL (<code>AS Name</code>). Il n'y a aucun fichier de configuration à écrire.`
    },
    {
      q: `Qu'est-ce qui différencie Dapper d'EF Core ?`,
      options: ["Dapper ne marche qu'avec des procédures stockées", "Avec Dapper, tu écris toi-même le SQL ; EF Core le génère à partir de LINQ", "Dapper ne gère pas les paramètres"],
      answer: 1,
      why: `Dapper exécute ton SQL et convertit les résultats en objets, rien de plus. EF Core génère le SQL et suit les modifications de tes objets. Dapper gère très bien les paramètres et le SQL classique.`
    }
  ],
  project: `<p><strong>OrderFlow : passer à Dapper.</strong> Ajoute le package Dapper à ta console.</p>
<ul>
<li>Dans le dossier <code>Data</code>, crée <code>DapperProductRepository</code> qui implémente <code>IProductRepository</code> avec les mêmes méthodes que <code>SqlProductRepository</code>.</li>
<li>Dans <code>Program.cs</code>, change uniquement la ligne qui crée le repository, et vérifie que le menu fonctionne exactement comme avant.</li>
<li>Réécris <code>OrderService.PlaceOrderAsync</code> avec Dapper et une transaction (exercice difficile), en gardant la vérification <code>Stock &gt;= @Quantity</code>.</li>
<li>Compte les lignes des deux repositories et note la différence en commentaire : tu la compareras avec EF Core dans la partie 3.</li>
</ul>`,
  resources: [
    { label: "Dapper sur NuGet", url: "https://www.nuget.org/packages/Dapper" },
    { label: "Dapper : documentation et exemples (GitHub)", url: "https://github.com/DapperLib/Dapper" }
  ]
});
