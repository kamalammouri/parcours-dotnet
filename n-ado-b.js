window.COURSE = window.COURSE || [];

/* ============================================================
   Jour 24 — ADO.NET : transactions et procédures stockées
   ============================================================ */
window.COURSE.push({
  key: "a-transactions",
  title: "ADO.NET : transactions et procédures stockées",
  summary: "Garantir qu'une commande s'enregistre entièrement ou pas du tout, choisir le bon niveau d'isolation et appeler des procédures stockées depuis C#.",
  objectives: [
    "Expliquer ACID et savoir quand une transaction est indispensable",
    "Écrire une transaction SqlTransaction correcte (commit, rollback, commande rattachée)",
    "Choisir un niveau d'isolation et reconnaître dirty read, non-repeatable read et phantom read",
    "Détecter un deadlock (erreur 1205) et rejouer l'opération proprement",
    "Utiliser TransactionScope sans tomber dans le piège de l'async",
    "Créer et appeler une procédure stockée avec paramètres OUTPUT et valeur de retour"
  ],
  lesson: `
<h3>Pourquoi une transaction ?</h3>
<p>Passer une commande dans OrderFlow, ce n'est pas une seule requête SQL. Il faut insérer une ligne dans <code>Orders</code>, une ligne par article dans <code>OrderLines</code>, puis décrémenter le stock de chaque produit dans <code>Products</code>. Si le serveur plante après l'insertion de la commande mais avant la mise à jour du stock, tu te retrouves avec une commande enregistrée et un stock faux. C'est exactement ce qu'une transaction empêche.</p>
<p>Une transaction regroupe plusieurs instructions en une seule unité de travail qui respecte les propriétés <strong>ACID</strong> :</p>
<table>
<thead><tr><th>Propriété</th><th>Signification</th><th>Dans OrderFlow</th></tr></thead>
<tbody>
<tr><td><strong>Atomicité</strong></td><td>Tout ou rien</td><td>La commande, ses lignes et le stock sont enregistrés ensemble, ou rien ne l'est</td></tr>
<tr><td><strong>Cohérence</strong></td><td>Les contraintes restent vraies</td><td>Les clés étrangères et le <code>CHECK (Stock &gt;= 0)</code> sont respectés</td></tr>
<tr><td><strong>Isolation</strong></td><td>Les transactions concurrentes ne se gênent pas (selon le niveau choisi)</td><td>Deux clients qui achètent le dernier article ne le reçoivent pas tous les deux</td></tr>
<tr><td><strong>Durabilité</strong></td><td>Une fois validé, c'est écrit sur disque</td><td>Après le <code>Commit</code>, une panne ne fait pas perdre la commande</td></tr>
</tbody>
</table>
<p>Si tu viens de Node.js, c'est l'équivalent de <code>await client.query('BEGIN')</code> … <code>COMMIT</code> / <code>ROLLBACK</code> avec <code>pg</code>, mais avec un objet dédié.</p>

<h3>SqlTransaction pas à pas</h3>
<p>Le schéma est toujours le même : ouvrir la connexion, démarrer la transaction, exécuter les commandes <em>en leur passant la transaction</em>, valider, et annuler en cas d'erreur.</p>
<pre><code>await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync(ct);

await using var tx = (SqlTransaction)await connection.BeginTransactionAsync(ct);
try
{
    await using var cmd = new SqlCommand(sql, connection, tx); // la transaction est passée ici
    await cmd.ExecuteNonQueryAsync(ct);

    await tx.CommitAsync(ct);
}
catch
{
    await tx.RollbackAsync(ct);
    throw; // on ne cache jamais l'erreur
}</code></pre>
<p><code>BeginTransactionAsync</code> renvoie un <code>DbTransaction</code> : le cast en <code>SqlTransaction</code> permet de le passer au constructeur de <code>SqlCommand</code>. Si la transaction est disposée sans <code>Commit</code>, SQL Server l'annule automatiquement : le <code>Rollback</code> explicite rend simplement l'intention lisible.</p>

<h3>Le piège n°1 : la commande doit recevoir la transaction</h3>
<p>Quand une connexion a une transaction en cours, <strong>chaque</strong> <code>SqlCommand</code> exécutée sur cette connexion doit référencer la transaction. Sinon tu obtiens :</p>
<p><code>InvalidOperationException: ExecuteNonQuery requires the command to have a transaction when the connection assigned to the command is in a pending local transaction.</code></p>
<p>Ce message très long veut dire une chose : tu as oublié <code>cmd.Transaction = tx</code> (ou le troisième argument du constructeur). Autre piège : ouvrir une <em>deuxième</em> connexion dans la même méthode. Elle ne fait pas partie de la transaction, et ses requêtes peuvent même se retrouver bloquées par les verrous que ta transaction a posés.</p>

<h3>Les niveaux d'isolation</h3>
<p>L'isolation règle ce qu'une transaction voit des modifications des autres. Plus le niveau est élevé, plus les données sont fiables, mais plus il y a de verrous et donc d'attente. On distingue trois phénomènes :</p>
<ul>
<li><strong>Dirty read</strong> : tu lis une modification qu'une autre transaction n'a pas encore validée (et qu'elle annulera peut-être).</li>
<li><strong>Non-repeatable read</strong> : tu relis la même ligne dans ta transaction et sa valeur a changé entre-temps.</li>
<li><strong>Phantom read</strong> : tu relances la même requête et de <em>nouvelles lignes</em> apparaissent.</li>
</ul>
<table>
<thead><tr><th>Niveau</th><th>Dirty read</th><th>Non-repeatable</th><th>Phantom</th><th>Coût</th></tr></thead>
<tbody>
<tr><td><code>ReadUncommitted</code> (= <code>NOLOCK</code>)</td><td>possible</td><td>possible</td><td>possible</td><td>aucun verrou en lecture, données potentiellement fausses</td></tr>
<tr><td><code>ReadCommitted</code> (défaut)</td><td>non</td><td>possible</td><td>possible</td><td>verrous de lecture courts</td></tr>
<tr><td><code>RepeatableRead</code></td><td>non</td><td>non</td><td>possible</td><td>verrous de lecture gardés jusqu'à la fin</td></tr>
<tr><td><code>Serializable</code></td><td>non</td><td>non</td><td>non</td><td>verrous de plage, beaucoup de blocages</td></tr>
<tr><td><code>Snapshot</code></td><td>non</td><td>non</td><td>non</td><td>versions des lignes dans tempdb, pas de verrou en lecture ; conflit d'écriture = erreur 3960</td></tr>
</tbody>
</table>
<p>On choisit le niveau au démarrage : <code>connection.BeginTransactionAsync(IsolationLevel.Serializable, ct)</code>.</p>

<h3>Snapshot et READ_COMMITTED_SNAPSHOT</h3>
<p>SQL Server propose deux variantes basées sur le versionnement des lignes :</p>
<ul>
<li><code>ALTER DATABASE OrderFlow SET ALLOW_SNAPSHOT_ISOLATION ON</code> autorise le niveau <code>Snapshot</code>, que tu demandes explicitement par transaction. Tu vois la base telle qu'elle était au début de ta transaction.</li>
<li><code>ALTER DATABASE OrderFlow SET READ_COMMITTED_SNAPSHOT ON</code> (RCSI) change le comportement du niveau par défaut : les lectures en <code>ReadCommitted</code> lisent la dernière version validée au lieu d'attendre les verrous des écrivains. Les lecteurs ne bloquent plus les écrivains, et inversement. C'est le réglage par défaut d'Azure SQL Database, et beaucoup d'équipes l'activent aussi sur SQL Server pour réduire les blocages.</li>
</ul>

<h3>Deadlocks et retry</h3>
<p>Un deadlock survient quand la transaction A attend un verrou de B pendant que B attend un verrou de A. SQL Server choisit une victime, annule sa transaction et renvoie l'erreur <strong>1205</strong>. Ce n'est pas un bug de SQL Server : c'est normal sous forte charge. Deux réponses :</p>
<ol>
<li><strong>Réduire le risque</strong> : transactions courtes, toujours accéder aux tables dans le même ordre (par exemple toujours <code>Products</code> trié par <code>Id</code>), index adaptés pour ne pas verrouiller trop de lignes.</li>
<li><strong>Rejouer</strong> : attraper <code>SqlException</code> avec <code>Number == 1205</code> et relancer <em>toute</em> la transaction (pas seulement la dernière requête), avec un petit délai et un nombre d'essais limité.</li>
</ol>

<h3>TransactionScope</h3>
<p><code>System.Transactions.TransactionScope</code> crée une transaction « ambiante » : toute connexion ouverte à l'intérieur du bloc s'y inscrit automatiquement, sans passer d'objet à chaque commande. C'est pratique quand plusieurs repositories doivent participer à la même transaction.</p>
<p>Le piège principal : <strong>par défaut, la transaction ambiante ne suit pas les <code>await</code></strong>. Après un <code>await</code>, le code peut reprendre sur un autre thread et la transaction est perdue, ce qui provoque une exception. Il faut toujours écrire :</p>
<pre><code>using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);</code></pre>
<p>Deux autres pièges : le niveau d'isolation par défaut de <code>TransactionScope</code> est <code>Serializable</code> (passe un <code>TransactionOptions</code> avec <code>ReadCommitted</code>), et si deux connexions différentes s'ouvrent dans le scope, la transaction peut être promue en transaction distribuée (MSDTC), lente et peu supportée hors Windows. Une seule connexion par scope, ou un <code>SqlTransaction</code> explicite.</p>

<h3>Procédures stockées</h3>
<p>Une procédure stockée est un bloc T-SQL nommé, stocké dans la base et appelé comme une fonction. On l'appelle depuis ADO.NET avec <code>CommandType.StoredProcedure</code> : le texte de la commande est alors le <em>nom</em> de la procédure.</p>
<pre><code>CREATE OR ALTER PROCEDURE dbo.GetCustomerStats
    @CustomerId INT,
    @OrderCount INT OUTPUT,
    @TotalSpent DECIMAL(18,2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Id = @CustomerId)
        RETURN 1; -- code d'erreur : client inconnu

    SELECT @OrderCount = COUNT(*), @TotalSpent = ISNULL(SUM(Total), 0)
    FROM dbo.Orders WHERE CustomerId = @CustomerId;
    RETURN 0;
END</code></pre>
<p>Côté C#, on distingue trois directions de paramètres : <code>Input</code> (défaut), <code>Output</code> (la procédure écrit dedans) et <code>ReturnValue</code> (l'entier du <code>RETURN</code>, uniquement un <code>int</code>). Les valeurs OUTPUT ne sont disponibles qu'<strong>après</strong> l'exécution, et si la procédure renvoie aussi des lignes, qu'après avoir fermé le <code>SqlDataReader</code>.</p>

<h3>Fonctions ou procédures ?</h3>
<table>
<thead><tr><th></th><th>Procédure stockée</th><th>Fonction (scalaire ou table)</th></tr></thead>
<tbody>
<tr><td>Modifie des données</td><td>oui</td><td>non</td></tr>
<tr><td>Utilisable dans un <code>SELECT</code></td><td>non</td><td>oui (<code>SELECT dbo.fn(...)</code>, <code>FROM dbo.fnTable(...)</code>)</td></tr>
<tr><td>Transactions, <code>TRY/CATCH</code></td><td>oui</td><td>non</td></tr>
<tr><td>Paramètres OUTPUT</td><td>oui</td><td>non (une valeur de retour)</td></tr>
<tr><td>Usage typique</td><td>traitement, rapport, opération en plusieurs étapes</td><td>calcul réutilisable dans des requêtes</td></tr>
</tbody>
</table>

<h3>Quand mettre de la logique en base ?</h3>
<p>Les règles métier (une commande ne peut pas dépasser 50 articles, un client bloqué ne peut pas commander) vivent dans le code C# : elles se testent, se versionnent et se lisent plus facilement. La base garde ce qu'elle fait mieux que personne : l'intégrité (clés, <code>UNIQUE</code>, <code>CHECK</code>), et les traitements ensemblistes lourds (rapports, agrégations sur des millions de lignes) où rapatrier les données en C# coûterait trop cher. En entreprise, tu croiseras aussi des applications legacy dont toute la logique est en procédures stockées : il faut savoir les appeler et les lire, même si tu n'en écris pas de nouvelles pour chaque règle.</p>

<div class="note">Une transaction doit être <strong>courte</strong> : on prépare tout (validation, calculs, appels HTTP) avant de l'ouvrir, puis on n'y met que les écritures. Ne fais jamais d'appel réseau externe (paiement, e-mail) à l'intérieur d'une transaction SQL : tu gardes des verrous pendant des secondes et tu ne peux pas annuler l'e-mail si le <code>Commit</code> échoue. Pour ce cas, on utilise le pattern outbox, vu plus tard dans le parcours. Et pour éviter la survente, préfère une mise à jour conditionnelle atomique (<code>UPDATE ... SET Stock = Stock - @q WHERE Id = @id AND Stock &gt;= @q</code>, puis vérifier le nombre de lignes modifiées) à un <code>SELECT</code> suivi d'un <code>UPDATE</code>.</div>

<h3>Récapitulatif des pièges</h3>
<ul>
<li>Oublier de passer la transaction à une commande : <code>InvalidOperationException</code>.</li>
<li>Ouvrir une seconde connexion dans la transaction : elle n'en fait pas partie.</li>
<li>Avaler l'exception dans le <code>catch</code> après le rollback : l'appelant croit que tout s'est bien passé.</li>
<li><code>TransactionScope</code> sans <code>TransactionScopeAsyncFlowOption.Enabled</code> dans du code async.</li>
<li>Lire les paramètres OUTPUT avant d'avoir fermé le reader.</li>
<li>Rejouer seulement la requête qui a échoué après un deadlock, au lieu de toute la transaction.</li>
</ul>
`,
  examples: [
    {
      title: "Passer une commande de façon atomique",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

// Hypothèse : tables Customers, Products(Id, Name, Price, Stock), Orders(Id, CustomerId, CreatedAt, Status, Total),
// OrderLines(Id, OrderId, ProductId, Quantity, UnitPrice) créées au jour 21.
public sealed record OrderItem(int ProductId, int Quantity);

public sealed class OrderWriter(string connectionString)
{
    public async Task<int> PlaceOrderAsync(int customerId, IReadOnlyList<OrderItem> items, CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var tx = (SqlTransaction)await connection.BeginTransactionAsync(ct);

        try
        {
            // 1. Créer la commande et récupérer son Id
            const string insertOrder = """
                INSERT INTO dbo.Orders (CustomerId, CreatedAt, Status, Total)
                OUTPUT INSERTED.Id
                VALUES (@CustomerId, SYSUTCDATETIME(), N'Pending', 0);
                """;
            await using var orderCmd = new SqlCommand(insertOrder, connection, tx);
            orderCmd.Parameters.Add("@CustomerId", SqlDbType.Int).Value = customerId;
            var orderId = (int)(await orderCmd.ExecuteScalarAsync(ct))!;

            decimal total = 0;
            // Toujours dans le même ordre (par Id) pour limiter les deadlocks
            foreach (var item in items.OrderBy(i => i.ProductId))
            {
                // 2. Décrémenter le stock seulement s'il est suffisant (atomique), et récupérer le prix
                const string reserve = """
                    UPDATE dbo.Products
                    SET Stock = Stock - @Quantity
                    OUTPUT INSERTED.Price
                    WHERE Id = @ProductId AND Stock >= @Quantity;
                    """;
                await using var stockCmd = new SqlCommand(reserve, connection, tx);
                stockCmd.Parameters.Add("@ProductId", SqlDbType.Int).Value = item.ProductId;
                stockCmd.Parameters.Add("@Quantity", SqlDbType.Int).Value = item.Quantity;
                var price = await stockCmd.ExecuteScalarAsync(ct);
                if (price is null)
                    throw new InvalidOperationException($"Stock insuffisant pour le produit {item.ProductId}.");

                var unitPrice = (decimal)price;
                total += unitPrice * item.Quantity;

                // 3. Insérer la ligne de commande
                const string insertLine = """
                    INSERT INTO dbo.OrderLines (OrderId, ProductId, Quantity, UnitPrice)
                    VALUES (@OrderId, @ProductId, @Quantity, @UnitPrice);
                    """;
                await using var lineCmd = new SqlCommand(insertLine, connection, tx);
                lineCmd.Parameters.Add("@OrderId", SqlDbType.Int).Value = orderId;
                lineCmd.Parameters.Add("@ProductId", SqlDbType.Int).Value = item.ProductId;
                lineCmd.Parameters.Add("@Quantity", SqlDbType.Int).Value = item.Quantity;
                var p = lineCmd.Parameters.Add("@UnitPrice", SqlDbType.Decimal);
                p.Precision = 18; p.Scale = 2; p.Value = unitPrice;
                await lineCmd.ExecuteNonQueryAsync(ct);
            }

            // 4. Mettre à jour le total
            await using var totalCmd = new SqlCommand("UPDATE dbo.Orders SET Total = @Total WHERE Id = @Id;", connection, tx);
            totalCmd.Parameters.Add("@Total", SqlDbType.Decimal).Value = total;
            totalCmd.Parameters.Add("@Id", SqlDbType.Int).Value = orderId;
            await totalCmd.ExecuteNonQueryAsync(ct);

            await tx.CommitAsync(ct);
            return orderId;
        }
        catch
        {
            await tx.RollbackAsync(CancellationToken.None); // annuler même si ct est déjà annulé
            throw;
        }
    }
}`,
      explain: "Chaque <code>SqlCommand</code> reçoit <code>tx</code> en troisième argument. L'<code>UPDATE ... WHERE Stock &gt;= @Quantity</code> avec <code>OUTPUT</code> vérifie et réserve le stock en une seule instruction atomique : si aucune ligne n'est renvoyée, le stock est insuffisant et toute la commande est annulée."
    },
    {
      title: "Observer les niveaux d'isolation (dirty read)",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

// Transaction A : modifie un prix sans valider
await using var connA = new SqlConnection(cs);
await connA.OpenAsync();
await using var txA = (SqlTransaction)await connA.BeginTransactionAsync();
await using (var update = new SqlCommand("UPDATE dbo.Products SET Price = 9999 WHERE Id = 1;", connA, txA))
    await update.ExecuteNonQueryAsync();

// Transaction B en ReadUncommitted : voit la valeur NON validée (dirty read)
await using (var connB = new SqlConnection(cs))
{
    await connB.OpenAsync();
    await using var txB = (SqlTransaction)await connB.BeginTransactionAsync(IsolationLevel.ReadUncommitted);
    await using var read = new SqlCommand("SELECT Price FROM dbo.Products WHERE Id = 1;", connB, txB);
    Console.WriteLine($"ReadUncommitted lit : {await read.ExecuteScalarAsync()}"); // 9999
    await txB.CommitAsync();
}

// Transaction C en ReadCommitted : attend que A se termine (sans RCSI)
var readCommitted = Task.Run(async () =>
{
    await using var connC = new SqlConnection(cs);
    await connC.OpenAsync();
    await using var txC = (SqlTransaction)await connC.BeginTransactionAsync(IsolationLevel.ReadCommitted);
    await using var read = new SqlCommand("SELECT Price FROM dbo.Products WHERE Id = 1;", connC, txC);
    var price = await read.ExecuteScalarAsync();
    await txC.CommitAsync();
    return price;
});

await Task.Delay(2000);
Console.WriteLine($"ReadCommitted terminé après 2 s ? {readCommitted.IsCompleted}"); // False : bloqué par le verrou de A

await txA.RollbackAsync(); // A annule : le prix 9999 n'a jamais existé
Console.WriteLine($"ReadCommitted lit finalement : {await readCommitted}"); // l'ancien prix`,
      explain: "Le dirty read est visible : B lit <code>9999</code>, une valeur qui sera annulée. C, en <code>ReadCommitted</code>, attend le verrou de A. Avec <code>READ_COMMITTED_SNAPSHOT ON</code>, C ne serait pas bloqué et lirait directement l'ancien prix validé."
    },
    {
      title: "Rejouer une transaction après un deadlock",
      code: `using Microsoft.Data.SqlClient;

public static class SqlRetry
{
    // 1205 = victime de deadlock, 3960 = conflit d'écriture en isolation Snapshot
    private static readonly HashSet<int> TransientErrors = [1205, 3960];

    public static async Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> operation, int maxAttempts = 3, CancellationToken ct = default)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                // L'opération ouvre SA connexion et SA transaction : on rejoue tout
                return await operation(ct);
            }
            catch (SqlException ex) when (TransientErrors.Contains(ex.Number) && attempt < maxAttempts)
            {
                var delay = TimeSpan.FromMilliseconds(100 * Math.Pow(2, attempt) + Random.Shared.Next(0, 100));
                Console.WriteLine($"Erreur {ex.Number}, nouvel essai {attempt + 1}/{maxAttempts} dans {delay.TotalMilliseconds:F0} ms");
                await Task.Delay(delay, ct);
            }
        }
    }
}

// Utilisation : toute la méthode PlaceOrderAsync est rejouée, pas une seule requête
// var orderId = await SqlRetry.ExecuteAsync(token => writer.PlaceOrderAsync(customerId, items, token));`,
      explain: "Le filtre <code>when</code> n'attrape que les erreurs transitoires et laisse remonter le reste. L'attente augmente à chaque essai (backoff exponentiel) avec un peu d'aléatoire pour que deux clients ne se retrouvent pas en conflit au même instant. Au module résilience, tu feras la même chose avec Polly."
    },
    {
      title: "TransactionScope dans du code async",
      code: `using System.Transactions;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

var options = new TransactionOptions
{
    IsolationLevel = IsolationLevel.ReadCommitted, // le défaut serait Serializable
    Timeout = TimeSpan.FromSeconds(30)
};

// AsyncFlowOption.Enabled est OBLIGATOIRE dès qu'il y a un await dans le bloc
using (var scope = new TransactionScope(TransactionScopeOption.Required, options, TransactionScopeAsyncFlowOption.Enabled))
{
    // Une seule connexion : pas de promotion en transaction distribuée
    await using var connection = new SqlConnection(cs);
    await connection.OpenAsync(); // la connexion s'inscrit automatiquement dans la transaction ambiante

    await using (var cmd = new SqlCommand("UPDATE dbo.Products SET Price = Price * 1.05 WHERE Id = @Id;", connection))
    {
        cmd.Parameters.AddWithValue("@Id", 1);
        await cmd.ExecuteNonQueryAsync(); // pas besoin de passer de transaction
    }

    await using (var log = new SqlCommand("INSERT INTO dbo.PriceHistory (ProductId, ChangedAt) VALUES (1, SYSUTCDATETIME());", connection))
        await log.ExecuteNonQueryAsync();

    scope.Complete(); // sans cet appel, tout est annulé à la sortie du using
}

Console.WriteLine("Hausse de prix et historique enregistrés ensemble.");`,
      explain: "Note le <code>System.Transactions.IsolationLevel</code>, qui est un type différent de <code>System.Data.IsolationLevel</code>. Pas de <code>Commit</code> : on appelle <code>scope.Complete()</code>, et la validation a lieu au <code>Dispose</code>. La table <code>PriceHistory</code> est un exemple, crée-la avant de lancer le code."
    },
    {
      title: "Procédure stockée avec paramètres OUTPUT et valeur de retour",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

// Procédure créée dans la leçon : dbo.GetCustomerStats(@CustomerId, @OrderCount OUTPUT, @TotalSpent OUTPUT)
public sealed record CustomerStats(int OrderCount, decimal TotalSpent);

public static class CustomerStatsReader
{
    public static async Task<CustomerStats?> GetAsync(string connectionString, int customerId, CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await using var cmd = new SqlCommand("dbo.GetCustomerStats", connection)
        {
            CommandType = CommandType.StoredProcedure // CommandText = nom de la procédure
        };

        cmd.Parameters.Add("@CustomerId", SqlDbType.Int).Value = customerId;

        var orderCount = cmd.Parameters.Add("@OrderCount", SqlDbType.Int);
        orderCount.Direction = ParameterDirection.Output;

        var totalSpent = cmd.Parameters.Add("@TotalSpent", SqlDbType.Decimal);
        totalSpent.Precision = 18;
        totalSpent.Scale = 2;
        totalSpent.Direction = ParameterDirection.Output;

        var returnCode = cmd.Parameters.Add("@ReturnValue", SqlDbType.Int);
        returnCode.Direction = ParameterDirection.ReturnValue;

        await connection.OpenAsync(ct);
        await cmd.ExecuteNonQueryAsync(ct);

        // Les valeurs ne sont lisibles qu'APRÈS l'exécution
        if ((int)returnCode.Value == 1)
            return null; // client inconnu

        return new CustomerStats((int)orderCount.Value, (decimal)totalSpent.Value);
    }
}

// var stats = await CustomerStatsReader.GetAsync(cs, 42);
// Console.WriteLine(stats is null ? "Client inconnu" : $"{stats.OrderCount} commandes, {stats.TotalSpent:C}");`,
      explain: "Pour un paramètre <code>Decimal</code> en sortie, précise <code>Precision</code> et <code>Scale</code>, sinon la valeur peut être arrondie. La valeur de retour sert aux codes de statut ; pour renvoyer des données, utilise des paramètres OUTPUT ou un <code>SELECT</code> lu avec un <code>SqlDataReader</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Virement de stock entre deux produits",
      prompt: "<p>Écris une méthode <code>MoveStockAsync(int fromProductId, int toProductId, int quantity)</code> qui retire <code>quantity</code> du stock du premier produit et l'ajoute au second, dans une seule transaction. Si le premier produit n'a pas assez de stock, rien ne doit être modifié et la méthode lève une exception.</p>",
      hint: "<p>Deux <code>UPDATE</code> sur la même connexion, avec la même transaction. Vérifie la valeur renvoyée par <code>ExecuteNonQueryAsync</code> (nombre de lignes modifiées) après le premier <code>UPDATE ... WHERE Stock &gt;= @Q</code>.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

public static async Task MoveStockAsync(string cs, int fromProductId, int toProductId, int quantity, CancellationToken ct = default)
{
    ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);

    await using var connection = new SqlConnection(cs);
    await connection.OpenAsync(ct);
    await using var tx = (SqlTransaction)await connection.BeginTransactionAsync(ct);
    try
    {
        await using var take = new SqlCommand(
            "UPDATE dbo.Products SET Stock = Stock - @Q WHERE Id = @Id AND Stock >= @Q;", connection, tx);
        take.Parameters.Add("@Q", SqlDbType.Int).Value = quantity;
        take.Parameters.Add("@Id", SqlDbType.Int).Value = fromProductId;
        if (await take.ExecuteNonQueryAsync(ct) == 0)
            throw new InvalidOperationException($"Stock insuffisant ou produit {fromProductId} introuvable.");

        await using var give = new SqlCommand(
            "UPDATE dbo.Products SET Stock = Stock + @Q WHERE Id = @Id;", connection, tx);
        give.Parameters.Add("@Q", SqlDbType.Int).Value = quantity;
        give.Parameters.Add("@Id", SqlDbType.Int).Value = toProductId;
        if (await give.ExecuteNonQueryAsync(ct) == 0)
            throw new InvalidOperationException($"Produit {toProductId} introuvable.");

        await tx.CommitAsync(ct);
    }
    catch
    {
        await tx.RollbackAsync(CancellationToken.None);
        throw;
    }
}`
    },
    {
      level: "moyen",
      title: "Procédure de rapport des ventes par produit",
      prompt: "<p>Crée une procédure stockée <code>dbo.GetSalesReport</code> qui prend <code>@From</code> et <code>@To</code> (DATETIME2) et renvoie, pour chaque produit vendu sur la période, son nom, la quantité totale vendue et le chiffre d'affaires, triés par chiffre d'affaires décroissant. Elle renvoie aussi le nombre de commandes de la période dans un paramètre OUTPUT <code>@OrderCount</code>. Appelle-la depuis C# et affiche le rapport.</p>",
      hint: "<p>Une jointure <code>OrderLines</code> → <code>Orders</code> → <code>Products</code> avec <code>GROUP BY</code>. Côté C#, lis les lignes avec <code>ExecuteReaderAsync</code>, puis <strong>ferme le reader</strong> avant de lire <code>@OrderCount</code>.</p>",
      solution: `-- SQL
CREATE OR ALTER PROCEDURE dbo.GetSalesReport
    @From DATETIME2,
    @To DATETIME2,
    @OrderCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @OrderCount = COUNT(*)
    FROM dbo.Orders
    WHERE CreatedAt >= @From AND CreatedAt < @To;

    SELECT p.Name,
           SUM(l.Quantity) AS QuantitySold,
           SUM(l.Quantity * l.UnitPrice) AS Revenue
    FROM dbo.OrderLines l
    JOIN dbo.Orders o ON o.Id = l.OrderId
    JOIN dbo.Products p ON p.Id = l.ProductId
    WHERE o.CreatedAt >= @From AND o.CreatedAt < @To
    GROUP BY p.Name
    ORDER BY Revenue DESC;
END

// C#
using System.Data;
using Microsoft.Data.SqlClient;

public sealed record SalesLine(string Product, int QuantitySold, decimal Revenue);

public static async Task<(IReadOnlyList<SalesLine> Lines, int OrderCount)> GetSalesReportAsync(
    string cs, DateTime from, DateTime to, CancellationToken ct = default)
{
    await using var connection = new SqlConnection(cs);
    await using var cmd = new SqlCommand("dbo.GetSalesReport", connection) { CommandType = CommandType.StoredProcedure };
    cmd.Parameters.Add("@From", SqlDbType.DateTime2).Value = from;
    cmd.Parameters.Add("@To", SqlDbType.DateTime2).Value = to;
    var orderCount = cmd.Parameters.Add("@OrderCount", SqlDbType.Int);
    orderCount.Direction = ParameterDirection.Output;

    await connection.OpenAsync(ct);
    var lines = new List<SalesLine>();
    await using (var reader = await cmd.ExecuteReaderAsync(ct))
    {
        while (await reader.ReadAsync(ct))
            lines.Add(new SalesLine(reader.GetString(0), reader.GetInt32(1), reader.GetDecimal(2)));
    } // le reader est fermé ici : le paramètre OUTPUT devient lisible

    return (lines, (int)orderCount.Value);
}

// Affichage
// var (lines, count) = await GetSalesReportAsync(cs, new DateTime(2026, 1, 1), new DateTime(2026, 2, 1));
// Console.WriteLine($"{count} commandes");
// foreach (var l in lines) Console.WriteLine($"{l.Product,-30} {l.QuantitySold,5} {l.Revenue,12:N2}");`
    },
    {
      level: "difficile",
      title: "Provoquer et gérer un deadlock",
      prompt: "<p>Écris un programme console qui provoque volontairement un deadlock : deux tâches ouvrent chacune une transaction, la tâche 1 met à jour le produit 1 puis le produit 2, la tâche 2 met à jour le produit 2 puis le produit 1, avec une pause de 500 ms au milieu. Constate l'erreur 1205. Ensuite, corrige le problème de deux façons : (1) avec le helper de retry de l'exemple 3, (2) en imposant un ordre d'accès commun.</p>",
      hint: "<p>Utilise <code>Task.WhenAll</code> pour lancer les deux tâches en même temps et un <code>try/catch (SqlException ex) when (ex.Number == 1205)</code> pour afficher quelle tâche a été choisie comme victime. Pour la deuxième correction, trie les Ids avant de faire les mises à jour.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

async Task UpdateTwoAsync(string name, int first, int second, bool sortIds)
{
    var ids = sortIds ? new[] { first, second }.Order().ToArray() : [first, second];

    await using var connection = new SqlConnection(cs);
    await connection.OpenAsync();
    await using var tx = (SqlTransaction)await connection.BeginTransactionAsync();
    try
    {
        foreach (var id in ids)
        {
            await using var cmd = new SqlCommand("UPDATE dbo.Products SET Stock = Stock + 0 WHERE Id = @Id;", connection, tx);
            cmd.Parameters.Add("@Id", SqlDbType.Int).Value = id;
            await cmd.ExecuteNonQueryAsync();
            Console.WriteLine($"{name} a verrouillé le produit {id}");
            await Task.Delay(500); // laisse à l'autre tâche le temps de prendre son premier verrou
        }
        await tx.CommitAsync();
        Console.WriteLine($"{name} : commit OK");
    }
    catch
    {
        await tx.RollbackAsync();
        throw;
    }
}

// 1. Provoquer le deadlock : ordres d'accès opposés
try
{
    await Task.WhenAll(UpdateTwoAsync("Tâche 1", 1, 2, sortIds: false), UpdateTwoAsync("Tâche 2", 2, 1, sortIds: false));
}
catch (SqlException ex) when (ex.Number == 1205)
{
    Console.WriteLine($"Deadlock détecté : {ex.Message}");
}

// 2. Correction n°1 : rejouer la victime
await Task.WhenAll(
    SqlRetry.ExecuteAsync(async _ => { await UpdateTwoAsync("Tâche 1 (retry)", 1, 2, false); return 0; }),
    SqlRetry.ExecuteAsync(async _ => { await UpdateTwoAsync("Tâche 2 (retry)", 2, 1, false); return 0; }));

// 3. Correction n°2 : même ordre d'accès pour tout le monde, plus de cycle d'attente possible
await Task.WhenAll(UpdateTwoAsync("Tâche 1 (triée)", 1, 2, true), UpdateTwoAsync("Tâche 2 (triée)", 2, 1, true));

// La correction n°2 supprime la cause : la tâche 2 attend simplement que la tâche 1 ait fini.
// La n°1 reste utile en production, car on ne peut pas garantir l'ordre partout.`
    }
  ],
  project: `<p>Dans <code>OrderFlow.Data.Ado</code> :</p>
<ul>
<li>Ajoute une classe <code>OrderWriter</code> avec <code>PlaceOrderAsync(customerId, items)</code> transactionnelle, en reprenant l'exemple 1 : vérification atomique du stock, insertion des lignes, calcul du total.</li>
<li>Enveloppe l'appel dans le helper <code>SqlRetry</code> pour les erreurs 1205.</li>
<li>Ajoute une contrainte <code>CHECK (Stock &gt;= 0)</code> sur <code>Products</code> comme filet de sécurité.</li>
<li>Crée la procédure <code>dbo.GetSalesReport</code> (exercice moyen) et une méthode <code>ReportReader.GetSalesReportAsync</code> qui l'appelle.</li>
<li>Test manuel : passe une commande qui dépasse le stock d'un des produits et vérifie dans SSMS qu'aucune ligne n'a été insérée dans <code>Orders</code>.</li>
</ul>`,
  resources: [
    { label: "Transactions locales dans ADO.NET", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/local-transactions" },
    { label: "Niveaux d'isolation (SET TRANSACTION ISOLATION LEVEL)", url: "https://learn.microsoft.com/sql/t-sql/statements/set-transaction-isolation-level-transact-sql" },
    { label: "Isolation Snapshot dans SQL Server", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/sql/snapshot-isolation-in-sql-server" },
    { label: "Implémenter une transaction implicite avec TransactionScope", url: "https://learn.microsoft.com/dotnet/framework/data/transactions/implementing-an-implicit-transaction-using-transaction-scope" },
    { label: "CREATE PROCEDURE (Transact-SQL)", url: "https://learn.microsoft.com/sql/t-sql/statements/create-procedure-transact-sql" }
  ]
});

/* ============================================================
   Jour 25 — ADO.NET : mode déconnecté et opérations en masse
   ============================================================ */
window.COURSE.push({
  key: "a-disconnected",
  title: "ADO.NET : mode déconnecté et opérations en masse",
  summary: "Comprendre DataSet, DataTable et DataAdapter pour lire le code legacy, puis importer des centaines de milliers de lignes en quelques secondes avec SqlBulkCopy et les Table-Valued Parameters.",
  objectives: [
    "Distinguer le mode connecté (SqlDataReader) du mode déconnecté (DataSet, DataTable)",
    "Lire et modifier des données avec DataAdapter.Fill et DataAdapter.Update",
    "Savoir pourquoi on évite les DataSet dans du code neuf, et convertir une DataTable en objets",
    "Importer 100 000 lignes avec SqlBulkCopy (mapping de colonnes, BatchSize)",
    "Passer une liste à SQL Server avec un Table-Valued Parameter et la fusionner avec MERGE",
    "Mesurer et comparer les performances avec Stopwatch"
  ],
  lesson: `
<h3>Deux façons de travailler avec ADO.NET</h3>
<p>Jusqu'ici tu as utilisé le <strong>mode connecté</strong> : une connexion ouverte, un <code>SqlDataReader</code> qui avance ligne par ligne, et tu fermes. C'est rapide et économe en mémoire. ADO.NET propose aussi, depuis 2002, un <strong>mode déconnecté</strong> : on charge les données dans des objets en mémoire (<code>DataSet</code>, <code>DataTable</code>), on ferme la connexion, on travaille dessus, puis on renvoie les modifications à la base.</p>
<table>
<thead><tr><th></th><th>Mode connecté</th><th>Mode déconnecté</th></tr></thead>
<tbody>
<tr><td>Objets</td><td><code>SqlCommand</code>, <code>SqlDataReader</code></td><td><code>SqlDataAdapter</code>, <code>DataSet</code>, <code>DataTable</code>, <code>DataRow</code></td></tr>
<tr><td>Connexion</td><td>ouverte pendant la lecture</td><td>ouverte seulement pendant <code>Fill</code> et <code>Update</code></td></tr>
<tr><td>Données</td><td>lecture en avant, une ligne à la fois</td><td>tout en mémoire, navigation libre, modifications suivies</td></tr>
<tr><td>Typage</td><td>tu mappes vers tes propres types</td><td>non typé : <code>row["Price"]</code> renvoie un <code>object</code></td></tr>
<tr><td>Usage aujourd'hui</td><td>code neuf, Dapper et EF Core reposent dessus</td><td>legacy, outils de reporting, scripts d'import</td></tr>
</tbody>
</table>

<h3>DataSet, DataTable, DataRow</h3>
<p>Une <code>DataTable</code> est une table en mémoire : une collection de <code>DataColumn</code> (nom, type) et de <code>DataRow</code>. Un <code>DataSet</code> est un conteneur de plusieurs <code>DataTable</code>, avec éventuellement des relations entre elles (<code>DataRelation</code>). Pense à un mini-schéma de base de données en mémoire.</p>
<p>Chaque <code>DataRow</code> garde son <strong>état</strong> (<code>RowState</code>) : <code>Unchanged</code>, <code>Added</code>, <code>Modified</code>, <code>Deleted</code>. C'est ce suivi des modifications qui permet au <code>DataAdapter</code> de savoir quoi renvoyer à la base. On retrouvera la même idée, en beaucoup plus confortable, avec le <em>change tracker</em> d'EF Core au module suivant.</p>

<h3>DataAdapter : Fill et Update</h3>
<p>Le <code>SqlDataAdapter</code> fait le pont entre la base et la <code>DataTable</code> :</p>
<ul>
<li><code>Fill(table)</code> ouvre la connexion si besoin, exécute la <code>SelectCommand</code>, remplit la table et referme la connexion.</li>
<li><code>Update(table)</code> parcourt les lignes modifiées et exécute, pour chacune, l'<code>InsertCommand</code>, l'<code>UpdateCommand</code> ou la <code>DeleteCommand</code>.</li>
</ul>
<p>Écrire ces trois commandes à la main est fastidieux. Le <code>SqlCommandBuilder</code> les génère à partir de la requête <code>SELECT</code>, à condition qu'elle porte sur <strong>une seule table</strong> et inclue sa <strong>clé primaire</strong>. Les commandes générées comparent toutes les colonnes d'origine dans le <code>WHERE</code> : c'est une forme de concurrence optimiste. Si quelqu'un a modifié la ligne entre-temps, <code>Update</code> lève une <code>DBConcurrencyException</code>.</p>

<h3>Pourquoi on les évite dans du code neuf</h3>
<ul>
<li><strong>Pas de typage</strong> : <code>(decimal)row["Price"]</code> compile toujours, et plante à l'exécution si la colonne s'appelle <code>UnitPrice</code> ou vaut <code>DBNull</code>.</li>
<li><strong>Mémoire</strong> : tout est chargé, avec des métadonnées par ligne et par colonne. Une <code>DataTable</code> de 100 000 lignes pèse bien plus lourd qu'une <code>List&lt;Product&gt;</code>.</li>
<li><strong>Couplage</strong> : le reste du code manipule des noms de colonnes SQL au lieu d'objets du domaine.</li>
<li><strong>Sérialisation</strong> : renvoyer un <code>DataSet</code> depuis une API produit un JSON illisible. On renvoie des DTO.</li>
</ul>
<p>Alors pourquoi apprendre ces objets ? Parce que tu les rencontreras : applications Web Forms et WinForms, services WCF, rapports Crystal Reports ou RDLC, scripts d'import écrits il y a quinze ans. Dans une mission de maintenance ou de migration .NET Framework vers .NET, savoir lire un <code>DataSet</code> et le remplacer progressivement par des types fortement typés est une compétence très demandée.</p>

<h3>De la DataTable aux objets</h3>
<p>Quand du code legacy te donne une <code>DataTable</code>, convertis-la le plus tôt possible en objets typés. La méthode d'extension <code>Field&lt;T&gt;()</code> (namespace <code>System.Data</code>, assembly <code>System.Data.DataSetExtensions</code>, incluse dans .NET) gère proprement <code>DBNull</code> avec les types nullables : <code>row.Field&lt;string?&gt;("Description")</code> renvoie <code>null</code> au lieu de planter. <code>AsEnumerable()</code> permet ensuite d'utiliser LINQ.</p>

<h3>SqlBulkCopy : importer en masse</h3>
<p>Insérer 100 000 produits avec une boucle d'<code>INSERT</code> signifie 100 000 allers-retours réseau, 100 000 instructions analysées et journalisées une par une. Même dans une transaction, compte plusieurs dizaines de secondes. <code>SqlBulkCopy</code> utilise le protocole d'insertion en masse de SQL Server (le même que l'outil <code>bcp</code>) : les lignes partent en flux, et l'import prend en général une à deux secondes.</p>
<p>Les réglages importants :</p>
<table>
<thead><tr><th>Propriété / option</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><code>DestinationTableName</code></td><td>table cible, par exemple <code>dbo.Products</code></td></tr>
<tr><td><code>ColumnMappings</code></td><td>associe les colonnes source aux colonnes cible <strong>par nom</strong>. Sans mapping, l'association se fait par position, source fréquente d'erreurs silencieuses.</td></tr>
<tr><td><code>BatchSize</code></td><td>nombre de lignes envoyées par lot (5 000 à 10 000 est un bon point de départ). 0 = tout en un seul lot.</td></tr>
<tr><td><code>BulkCopyTimeout</code></td><td>en secondes, 30 par défaut : à augmenter pour les gros imports</td></tr>
<tr><td><code>EnableStreaming</code></td><td>lit la source au fil de l'eau quand elle est un <code>IDataReader</code></td></tr>
<tr><td><code>SqlBulkCopyOptions.CheckConstraints</code></td><td>vérifie les contraintes <code>CHECK</code> et les clés étrangères (désactivées par défaut)</td></tr>
<tr><td><code>SqlBulkCopyOptions.TableLock</code></td><td>verrou de table pendant l'import : plus rapide, mais bloque les autres utilisateurs</td></tr>
<tr><td><code>NotifyAfter</code> + <code>SqlRowsCopied</code></td><td>événement de progression toutes les N lignes</td></tr>
</tbody>
</table>
<p>La source peut être une <code>DataTable</code> (simple, mais tout en mémoire) ou un <code>IDataReader</code> (en flux, idéal pour copier d'une base à une autre). Attention : par défaut, <code>SqlBulkCopy</code> <strong>ne vérifie pas</strong> les contraintes <code>CHECK</code> et les clés étrangères, et ne déclenche pas les triggers.</p>

<h3>Table-Valued Parameters</h3>
<p>Comment envoyer une liste de 500 Ids à une requête ? Concaténer <code>WHERE Id IN (1, 2, 3, ...)</code> est dangereux (injection) et chaque liste différente produit un nouveau plan d'exécution. La bonne réponse SQL Server est le <strong>Table-Valued Parameter</strong> (TVP) : on déclare un <em>type table</em> dans la base, puis on passe une <code>DataTable</code> (ou un <code>IEnumerable&lt;SqlDataRecord&gt;</code>) comme paramètre de type <code>SqlDbType.Structured</code>.</p>
<pre><code>CREATE TYPE dbo.ProductPriceList AS TABLE
(
    Sku NVARCHAR(50) NOT NULL PRIMARY KEY,
    Price DECIMAL(18,2) NOT NULL
);</code></pre>
<p>Côté SQL, le paramètre se comporte comme une table en lecture seule : on peut faire un <code>JOIN</code> dessus. C'est la façon propre de faire des mises à jour en masse quand <code>SqlBulkCopy</code> ne suffit pas, car <code>SqlBulkCopy</code> sait seulement <em>insérer</em>.</p>

<h3>MERGE en aperçu</h3>
<p><code>MERGE</code> combine insertion, mise à jour et suppression en une instruction : « pour chaque produit du fichier, mets à jour le prix s'il existe, sinon insère-le ». Avec un TVP en source, tu synchronises tout un catalogue en un seul aller-retour. <code>MERGE</code> a cependant des comportements surprenants en concurrence : ajoute l'indicateur <code>WITH (HOLDLOCK)</code> sur la cible, et beaucoup d'équipes préfèrent un <code>UPDATE ... FROM</code> suivi d'un <code>INSERT ... WHERE NOT EXISTS</code>, plus lisibles.</p>

<h3>Mesurer plutôt que deviner</h3>
<p><code>System.Diagnostics.Stopwatch</code> suffit pour comparer deux approches : <code>var sw = Stopwatch.StartNew(); ...; sw.Elapsed</code>. Mesure toujours sur un volume réaliste, après un premier appel « à vide » (le premier appel inclut l'ouverture du pool de connexions et la compilation JIT), et sur la même machine. BenchmarkDotNet, vu plus tard, rend ces mesures rigoureuses.</p>

<div class="note">Un import en masse dans une table utilisée en production se fait rarement directement dans la table cible. Le pattern classique : <code>SqlBulkCopy</code> vers une <strong>table de staging</strong> (<code>dbo.ProductsImport</code>), validation en SQL (doublons, SKU vides, prix négatifs), puis <code>INSERT/UPDATE</code> ensembliste vers la vraie table dans une transaction courte. Tu gardes la vitesse du bulk, tu ne bloques pas les utilisateurs pendant l'import et tu peux rejeter un fichier invalide sans rien casser.</div>

<h3>Pièges courants</h3>
<ul>
<li>Lire <code>row["Col"]</code> sans gérer <code>DBNull.Value</code> : <code>InvalidCastException</code>. Utilise <code>Field&lt;T?&gt;</code>.</li>
<li><code>SqlCommandBuilder</code> sur une requête avec jointure ou sans clé primaire : exception à la génération des commandes.</li>
<li><code>SqlBulkCopy</code> sans <code>ColumnMappings</code> : les colonnes sont associées par position, et la colonne <code>Id</code> identity décale tout.</li>
<li>Colonne <code>DataTable</code> de type <code>double</code> pour une colonne SQL <code>DECIMAL</code> : erreurs d'arrondi. Utilise <code>typeof(decimal)</code>.</li>
<li>Oublier que <code>SqlBulkCopy</code> ignore les contraintes par défaut.</li>
<li>Colonnes du TVP dans un ordre différent de celui du type SQL : les valeurs sont associées par position.</li>
</ul>
`,
  examples: [
    {
      title: "Charger des données avec SqlDataAdapter.Fill",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

var dataSet = new DataSet("OrderFlow");

await using (var connection = new SqlConnection(cs))
{
    // Fill ouvre et referme la connexion tout seul
    using var customers = new SqlDataAdapter("SELECT Id, Name, Email FROM dbo.Customers;", connection);
    customers.Fill(dataSet, "Customers");

    using var orders = new SqlDataAdapter("SELECT Id, CustomerId, CreatedAt, Total FROM dbo.Orders;", connection);
    orders.Fill(dataSet, "Orders");
}

// La connexion est fermée : on travaille en mémoire
var relation = dataSet.Relations.Add("CustomerOrders",
    dataSet.Tables["Customers"]!.Columns["Id"]!,
    dataSet.Tables["Orders"]!.Columns["CustomerId"]!);

foreach (DataRow customer in dataSet.Tables["Customers"]!.Rows)
{
    var customerOrders = customer.GetChildRows(relation);
    var total = customerOrders.Sum(o => o.Field<decimal>("Total"));
    Console.WriteLine($"{customer.Field<string>("Name"),-25} {customerOrders.Length,3} commandes  {total,10:N2}");
}

Console.WriteLine($"Colonnes de Orders : {string.Join(", ", dataSet.Tables["Orders"]!.Columns.Cast<DataColumn>().Select(c => $"{c.ColumnName} ({c.DataType.Name})"))}");`,
      explain: "C'est le style de code que tu trouveras dans les applications .NET Framework. La <code>DataRelation</code> remplace une jointure, mais tout est chargé en mémoire : sur une vraie base avec des millions de commandes, ce code serait inutilisable."
    },
    {
      title: "Modifier puis renvoyer avec DataAdapter.Update et SqlCommandBuilder",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

await using var connection = new SqlConnection(cs);
// Une seule table, clé primaire incluse : condition pour le CommandBuilder
using var adapter = new SqlDataAdapter("SELECT Id, Name, Sku, Price, Stock FROM dbo.Products;", connection);
using var builder = new SqlCommandBuilder(adapter); // génère INSERT, UPDATE et DELETE

var products = new DataTable();
adapter.Fill(products);

// 1. Modification : +10 % sur les produits à moins de 20 €
foreach (DataRow row in products.Rows)
    if (row.Field<decimal>("Price") < 20m)
        row["Price"] = Math.Round(row.Field<decimal>("Price") * 1.10m, 2);

// 2. Ajout
var newRow = products.NewRow();
newRow["Name"] = "Clavier mécanique";
newRow["Sku"] = "KB-001";
newRow["Price"] = 89.90m;
newRow["Stock"] = 25;
products.Rows.Add(newRow);

// État des lignes avant envoi
foreach (var group in products.Rows.Cast<DataRow>().GroupBy(r => r.RowState))
    Console.WriteLine($"{group.Key} : {group.Count()}");

Console.WriteLine($"UPDATE généré : {builder.GetUpdateCommand().CommandText}");

try
{
    var affected = adapter.Update(products); // une commande SQL par ligne modifiée
    Console.WriteLine($"{affected} lignes envoyées à la base");
}
catch (DBConcurrencyException ex)
{
    Console.WriteLine($"Quelqu'un a modifié la ligne entre-temps : {ex.Message}");
}`,
      explain: "Affiche la commande générée : son <code>WHERE</code> compare toutes les colonnes d'origine, ce qui garantit qu'on n'écrase pas une modification faite par quelqu'un d'autre. Note aussi que <code>Update</code> envoie une requête par ligne : ce n'est pas une opération en masse."
    },
    {
      title: "Convertir une DataTable en records typés",
      code: `using System.Data;

public sealed record Product(int Id, string Name, string Sku, decimal Price, int Stock, string? Description);

public static class DataTableExtensions
{
    // À appeler dès qu'un code legacy te donne une DataTable
    public static List<Product> ToProducts(this DataTable table) =>
        table.AsEnumerable()
             .Select(row => new Product(
                 Id: row.Field<int>("Id"),
                 Name: row.Field<string>("Name")!,
                 Sku: row.Field<string>("Sku")!,
                 Price: row.Field<decimal>("Price"),
                 Stock: row.Field<int>("Stock"),
                 Description: row.Field<string?>("Description"))) // DBNull -> null, sans exception
             .ToList();
}

// Démonstration sans base de données
var table = new DataTable();
table.Columns.Add("Id", typeof(int));
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Sku", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));
table.Columns.Add("Description", typeof(string));
table.Rows.Add(1, "Souris", "MS-001", 19.90m, 120, DBNull.Value);
table.Rows.Add(2, "Écran 27 pouces", "SC-027", 249.00m, 8, "IPS, 144 Hz");

foreach (var p in table.ToProducts())
    Console.WriteLine($"{p.Name} : {p.Price:C} ({p.Description ?? "pas de description"})");

// À éviter : (string)row["Description"] lèverait InvalidCastException sur DBNull`,
      explain: "<code>Field&lt;T&gt;</code> fait la conversion et transforme <code>DBNull.Value</code> en <code>null</code> pour les types nullables. À partir de là, le reste du code manipule des <code>Product</code> typés et vérifiés par le compilateur."
    },
    {
      title: "Boucle d'INSERT contre SqlBulkCopy : 100 000 lignes",
      code: `using System.Data;
using System.Diagnostics;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";
const int count = 100_000;

// Table de test : CREATE TABLE dbo.ProductsImport (Id INT IDENTITY PRIMARY KEY, Name NVARCHAR(200), Sku NVARCHAR(50), Price DECIMAL(18,2), Stock INT);
await Truncate();

// 1. Boucle d'INSERT paramétrés dans une transaction (déjà mieux que sans transaction)
var sw = Stopwatch.StartNew();
await using (var connection = new SqlConnection(cs))
{
    await connection.OpenAsync();
    await using var tx = (SqlTransaction)await connection.BeginTransactionAsync();
    await using var cmd = new SqlCommand("INSERT INTO dbo.ProductsImport (Name, Sku, Price, Stock) VALUES (@Name, @Sku, @Price, @Stock);", connection, tx);
    var name = cmd.Parameters.Add("@Name", SqlDbType.NVarChar, 200);
    var sku = cmd.Parameters.Add("@Sku", SqlDbType.NVarChar, 50);
    var price = cmd.Parameters.Add("@Price", SqlDbType.Decimal); price.Precision = 18; price.Scale = 2;
    var stock = cmd.Parameters.Add("@Stock", SqlDbType.Int);
    for (var i = 0; i < count; i++)
    {
        name.Value = $"Produit {i}"; sku.Value = $"SKU-{i:D6}"; price.Value = 10m + i % 100; stock.Value = i % 50;
        await cmd.ExecuteNonQueryAsync();
    }
    await tx.CommitAsync();
}
Console.WriteLine($"Boucle d'INSERT : {sw.Elapsed.TotalSeconds:F1} s");

await Truncate();

// 2. SqlBulkCopy depuis une DataTable
var table = new DataTable();
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Sku", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));
for (var i = 0; i < count; i++)
    table.Rows.Add($"Produit {i}", $"SKU-{i:D6}", 10m + i % 100, i % 50);

sw.Restart();
await using (var connection = new SqlConnection(cs))
{
    await connection.OpenAsync();
    using var bulk = new SqlBulkCopy(connection, SqlBulkCopyOptions.CheckConstraints, null)
    {
        DestinationTableName = "dbo.ProductsImport",
        BatchSize = 10_000,
        BulkCopyTimeout = 120,
        NotifyAfter = 25_000
    };
    // Mapping par nom : la colonne Id (identity) n'est pas dans la source
    foreach (var column in new[] { "Name", "Sku", "Price", "Stock" })
        bulk.ColumnMappings.Add(column, column);
    bulk.SqlRowsCopied += (_, e) => Console.WriteLine($"  {e.RowsCopied} lignes copiées");

    await bulk.WriteToServerAsync(table);
}
Console.WriteLine($"SqlBulkCopy : {sw.Elapsed.TotalSeconds:F1} s");

async Task Truncate()
{
    await using var connection = new SqlConnection(cs);
    await connection.OpenAsync();
    await using var cmd = new SqlCommand("TRUNCATE TABLE dbo.ProductsImport;", connection);
    await cmd.ExecuteNonQueryAsync();
}`,
      explain: "Sur une machine de développement avec SQL Server dans Docker, la boucle prend généralement plusieurs dizaines de secondes, et <code>SqlBulkCopy</code> une à deux secondes. Les chiffres varient selon la machine : lance le programme pour voir les tiens. La commande est réutilisée dans la boucle, seule la valeur des paramètres change."
    },
    {
      title: "Table-Valued Parameter et MERGE : mettre à jour des prix en masse",
      code: `using System.Data;
using Microsoft.Data.SqlClient;

/* SQL à exécuter une fois :
CREATE TYPE dbo.ProductPriceList AS TABLE
(
    Sku NVARCHAR(50) NOT NULL PRIMARY KEY,
    Price DECIMAL(18,2) NOT NULL
);
*/

public static class PriceUpdater
{
    public static async Task<int> UpdatePricesAsync(string cs, IReadOnlyDictionary<string, decimal> pricesBySku, CancellationToken ct = default)
    {
        // Les colonnes doivent être dans le MÊME ORDRE que dans le type SQL
        var tvp = new DataTable();
        tvp.Columns.Add("Sku", typeof(string));
        tvp.Columns.Add("Price", typeof(decimal));
        foreach (var (sku, price) in pricesBySku)
            tvp.Rows.Add(sku, price);

        const string sql = """
            MERGE dbo.Products WITH (HOLDLOCK) AS target
            USING @Prices AS source
                ON target.Sku = source.Sku
            WHEN MATCHED AND target.Price <> source.Price THEN
                UPDATE SET target.Price = source.Price
            WHEN NOT MATCHED BY TARGET THEN
                INSERT (Name, Sku, Price, Stock) VALUES (source.Sku, source.Sku, source.Price, 0);
            """;

        await using var connection = new SqlConnection(cs);
        await using var cmd = new SqlCommand(sql, connection);
        var parameter = cmd.Parameters.Add("@Prices", SqlDbType.Structured);
        parameter.TypeName = "dbo.ProductPriceList"; // nom du type table SQL
        parameter.Value = tvp;

        await connection.OpenAsync(ct);
        return await cmd.ExecuteNonQueryAsync(ct); // lignes insérées + mises à jour
    }
}

// var changed = await PriceUpdater.UpdatePricesAsync(cs, new Dictionary<string, decimal> { ["MS-001"] = 17.90m, ["NEW-42"] = 5m });
// Console.WriteLine($"{changed} produits modifiés ou créés en un seul aller-retour");`,
      explain: "Un seul aller-retour réseau, un plan d'exécution réutilisé quelle que soit la taille de la liste, et aucune concaténation de SQL. Le <code>WITH (HOLDLOCK)</code> évite qu'une insertion concurrente provoque une violation de clé pendant le <code>MERGE</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire une DataTable legacy",
      prompt: "<p>On te donne une méthode legacy <code>DataTable GetCustomers()</code> qui renvoie les colonnes <code>Id</code> (int), <code>Name</code> (string), <code>Email</code> (string, peut être <code>DBNull</code>) et <code>CreatedAt</code> (DateTime). Écris une méthode d'extension <code>ToCustomers()</code> qui la convertit en <code>List&lt;Customer&gt;</code> (record), puis affiche les clients sans e-mail. Teste avec une <code>DataTable</code> construite à la main.</p>",
      hint: "<p><code>table.AsEnumerable().Select(...)</code> et <code>row.Field&lt;string?&gt;(\"Email\")</code>.</p>",
      solution: `using System.Data;

public sealed record Customer(int Id, string Name, string? Email, DateTime CreatedAt);

public static class CustomerTableExtensions
{
    public static List<Customer> ToCustomers(this DataTable table) =>
        table.AsEnumerable()
             .Select(r => new Customer(
                 r.Field<int>("Id"),
                 r.Field<string>("Name")!,
                 r.Field<string?>("Email"),
                 r.Field<DateTime>("CreatedAt")))
             .ToList();
}

// Test
var table = new DataTable();
table.Columns.Add("Id", typeof(int));
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Email", typeof(string));
table.Columns.Add("CreatedAt", typeof(DateTime));
table.Rows.Add(1, "Alice", "alice@example.com", new DateTime(2026, 1, 10));
table.Rows.Add(2, "Bob", DBNull.Value, new DateTime(2026, 2, 3));
table.Rows.Add(3, "Chloé", DBNull.Value, new DateTime(2026, 3, 21));

var withoutEmail = table.ToCustomers().Where(c => c.Email is null);
foreach (var c in withoutEmail)
    Console.WriteLine($"{c.Name} (inscrit le {c.CreatedAt:d}) n'a pas d'e-mail");`
    },
    {
      level: "moyen",
      title: "Copier une table d'une base à une autre en flux",
      prompt: "<p>Écris une méthode <code>CopyOrdersAsync(string sourceCs, string targetCs, DateTime since)</code> qui copie les commandes créées depuis <code>since</code> d'une base <code>OrderFlow</code> vers une base <code>OrderFlowArchive</code> (même schéma pour <code>Orders</code>), <strong>sans charger les lignes en mémoire</strong>, en affichant la progression toutes les 10 000 lignes. Les Ids d'origine doivent être conservés.</p>",
      hint: "<p>Passe un <code>SqlDataReader</code> à <code>WriteToServerAsync</code> avec <code>EnableStreaming = true</code>. Pour conserver la colonne identity, utilise l'option <code>SqlBulkCopyOptions.KeepIdentity</code>.</p>",
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

public static async Task<long> CopyOrdersAsync(string sourceCs, string targetCs, DateTime since, CancellationToken ct = default)
{
    await using var source = new SqlConnection(sourceCs);
    await source.OpenAsync(ct);
    await using var select = new SqlCommand(
        "SELECT Id, CustomerId, CreatedAt, Status, Total FROM dbo.Orders WHERE CreatedAt >= @Since;", source);
    select.Parameters.Add("@Since", SqlDbType.DateTime2).Value = since;
    await using var reader = await select.ExecuteReaderAsync(ct);

    await using var target = new SqlConnection(targetCs);
    await target.OpenAsync(ct);

    long copied = 0;
    using var bulk = new SqlBulkCopy(target, SqlBulkCopyOptions.KeepIdentity | SqlBulkCopyOptions.CheckConstraints, null)
    {
        DestinationTableName = "dbo.Orders",
        EnableStreaming = true, // lit le reader au fil de l'eau
        BatchSize = 10_000,
        BulkCopyTimeout = 0,    // pas de limite pour une copie longue
        NotifyAfter = 10_000
    };
    foreach (var column in new[] { "Id", "CustomerId", "CreatedAt", "Status", "Total" })
        bulk.ColumnMappings.Add(column, column);
    bulk.SqlRowsCopied += (_, e) => { copied = e.RowsCopied; Console.WriteLine($"{e.RowsCopied} commandes copiées"); };

    await bulk.WriteToServerAsync(reader, ct);
    return bulk.RowsCopied64; // total exact, même si le dernier lot n'a pas déclenché l'événement
}`
    },
    {
      level: "difficile",
      title: "Import via table de staging avec rapport d'erreurs",
      prompt: "<p>Implémente le pattern de la note « Niveau senior » : charge une liste de 50 000 produits (générés en mémoire, dont quelques-uns invalides : SKU vide, prix négatif, SKU en double) dans <code>dbo.ProductsStaging</code> avec <code>SqlBulkCopy</code>, puis, dans une transaction : supprime les lignes invalides de la staging en les comptant, met à jour les produits existants (même SKU) et insère les nouveaux. Affiche un rapport : lignes reçues, rejetées, mises à jour, insérées, durée totale.</p>",
      hint: "<p>Commence par <code>TRUNCATE TABLE dbo.ProductsStaging</code>. Pour les doublons, un <code>DELETE</code> sur une CTE avec <code>ROW_NUMBER() OVER (PARTITION BY Sku ORDER BY (SELECT 0))</code>. <code>UPDATE p SET ... FROM dbo.Products p JOIN dbo.ProductsStaging s ON s.Sku = p.Sku</code>, puis <code>INSERT ... WHERE NOT EXISTS</code>. <code>@@ROWCOUNT</code> ou la valeur de retour de <code>ExecuteNonQueryAsync</code> donne les compteurs.</p>",
      solution: `using System.Data;
using System.Diagnostics;
using Microsoft.Data.SqlClient;

// CREATE TABLE dbo.ProductsStaging (Name NVARCHAR(200) NULL, Sku NVARCHAR(50) NULL, Price DECIMAL(18,2) NULL, Stock INT NULL);
const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

var sw = Stopwatch.StartNew();

// 1. Données d'entrée avec quelques lignes invalides
var table = new DataTable();
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Sku", typeof(string));
table.Columns.Add("Price", typeof(decimal));
table.Columns.Add("Stock", typeof(int));
for (var i = 0; i < 50_000; i++)
{
    var sku = i % 5_000 == 0 ? "" : $"SKU-{i % 49_990:D6}"; // SKU vides + quelques doublons
    var price = i % 7_000 == 0 ? -1m : 5m + i % 200;       // quelques prix négatifs
    table.Rows.Add($"Produit {i}", sku, price, i % 30);
}

await using var connection = new SqlConnection(cs);
await connection.OpenAsync();

// 2. Bulk vers la staging (aucun verrou sur la vraie table)
await Exec("TRUNCATE TABLE dbo.ProductsStaging;");
using (var bulk = new SqlBulkCopy(connection) { DestinationTableName = "dbo.ProductsStaging", BatchSize = 10_000 })
{
    foreach (var c in new[] { "Name", "Sku", "Price", "Stock" }) bulk.ColumnMappings.Add(c, c);
    await bulk.WriteToServerAsync(table);
}

// 3. Validation et fusion dans une transaction courte
await using var tx = (SqlTransaction)await connection.BeginTransactionAsync();
try
{
    var invalid = await Exec("""
        DELETE FROM dbo.ProductsStaging
        WHERE Sku IS NULL OR LTRIM(RTRIM(Sku)) = N'' OR Price IS NULL OR Price < 0 OR Stock IS NULL OR Stock < 0;
        """, tx);

    var duplicates = await Exec("""
        WITH d AS (SELECT ROW_NUMBER() OVER (PARTITION BY Sku ORDER BY (SELECT 0)) AS rn FROM dbo.ProductsStaging)
        DELETE FROM d WHERE rn > 1;
        """, tx);

    var updated = await Exec("""
        UPDATE p SET p.Name = s.Name, p.Price = s.Price, p.Stock = s.Stock
        FROM dbo.Products p
        JOIN dbo.ProductsStaging s ON s.Sku = p.Sku;
        """, tx);

    var inserted = await Exec("""
        INSERT INTO dbo.Products (Name, Sku, Price, Stock)
        SELECT s.Name, s.Sku, s.Price, s.Stock
        FROM dbo.ProductsStaging s
        WHERE NOT EXISTS (SELECT 1 FROM dbo.Products p WHERE p.Sku = s.Sku);
        """, tx);

    await tx.CommitAsync();

    Console.WriteLine($"Reçues     : {table.Rows.Count}");
    Console.WriteLine($"Rejetées   : {invalid} invalides, {duplicates} doublons");
    Console.WriteLine($"Mises à jour : {updated}");
    Console.WriteLine($"Insérées   : {inserted}");
    Console.WriteLine($"Durée      : {sw.Elapsed.TotalSeconds:F1} s");
}
catch
{
    await tx.RollbackAsync();
    throw;
}

async Task<int> Exec(string sql, SqlTransaction? transaction = null)
{
    await using var cmd = new SqlCommand(sql, connection, transaction) { CommandTimeout = 120 };
    return await cmd.ExecuteNonQueryAsync();
}`
    }
  ],
  project: `<p>Dans <code>OrderFlow.Data.Ado</code>, ajoute un import de catalogue :</p>
<ul>
<li>Un fichier <code>data/products.csv</code> (colonnes <code>Name;Sku;Price;Stock</code>, séparateur point-virgule) que tu génères avec 100 000 lignes.</li>
<li>Une classe <code>CatalogImporter</code> avec <code>ImportAsync(string csvPath)</code> : lecture ligne par ligne avec <code>File.ReadLines</code>, parsing avec <code>decimal.Parse(..., CultureInfo.InvariantCulture)</code>, construction d'une <code>DataTable</code>, puis <code>SqlBulkCopy</code> vers <code>dbo.ProductsStaging</code> et fusion vers <code>dbo.Products</code> comme dans l'exercice difficile.</li>
<li>Les lignes illisibles du CSV sont comptées et écrites dans un fichier <code>import-errors.txt</code> avec leur numéro de ligne.</li>
<li>Affiche la durée totale et compare-la avec une version naïve qui fait un <code>INSERT</code> par ligne sur les 5 000 premières lignes.</li>
</ul>`,
  resources: [
    { label: "DataSets, DataTables et DataViews", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/dataset-datatable-dataview/" },
    { label: "Remplir un DataSet à partir d'un DataAdapter", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/populating-a-dataset-from-a-dataadapter" },
    { label: "Opérations de copie en bloc dans SQL Server", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/sql/bulk-copy-operations-in-sql-server" },
    { label: "Paramètres table (Table-Valued Parameters)", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/sql/table-valued-parameters" },
    { label: "MERGE (Transact-SQL)", url: "https://learn.microsoft.com/sql/t-sql/statements/merge-transact-sql" }
  ]
});

/* ============================================================
   Jour 26 — Repository ADO.NET et Dapper
   ============================================================ */
window.COURSE.push({
  key: "a-repository-dapper",
  title: "Repository ADO.NET et Dapper",
  summary: "Ranger l'accès aux données derrière une interface propre, le tester contre une vraie base, puis réécrire le même repository avec Dapper et comparer les trois approches d'accès aux données.",
  objectives: [
    "Concevoir un repository ADO.NET async, annulable et injectable",
    "Gérer la création des connexions avec une IDbConnectionFactory enregistrée dans la DI",
    "Écrire des tests d'intégration contre SQL Server",
    "Utiliser Dapper : QueryAsync, QuerySingleOrDefaultAsync, ExecuteAsync, paramètres anonymes",
    "Charger un agrégat Order + OrderLines avec le multi-mapping et QueryMultiple",
    "Choisir entre ADO.NET, Dapper et EF Core selon le contexte"
  ],
  lesson: `
<h3>Pourquoi un repository ?</h3>
<p>Aux jours précédents, le SQL était écrit directement dans les méthodes qui en avaient besoin. Dans une vraie application, ce code d'accès aux données se retrouverait éparpillé dans les contrôleurs, les services et les jobs, avec la même requête dupliquée trois fois. Le <strong>repository</strong> regroupe l'accès à un type de données derrière une interface : le reste de l'application demande <code>GetByIdAsync(42)</code> et ne sait pas si derrière il y a du SQL brut, Dapper, EF Core ou un appel HTTP.</p>
<p>Ses bénéfices concrets :</p>
<ul>
<li><strong>Un seul endroit</strong> pour chaque requête : si une colonne change, tu modifies une méthode.</li>
<li><strong>Testabilité</strong> : un service qui dépend de <code>IProductRepository</code> se teste avec une fausse implémentation en mémoire.</li>
<li><strong>Remplaçabilité</strong> : c'est ce que tu vas faire aujourd'hui en passant d'ADO.NET à Dapper sans toucher au code appelant.</li>
</ul>
<p>Une interface qui n'a qu'une implémentation et qui n'est jamais remplacée est souvent de la cérémonie inutile. Ici, elle est justifiée : on a deux implémentations, et les services qui l'utilisent ont des tests unitaires. Au module EF Core, tu verras le débat « faut-il un repository au-dessus de <code>DbContext</code> ? ».</p>

<h3>Les règles d'un bon repository ADO.NET</h3>
<ul>
<li><strong>Async partout</strong>, avec un <code>CancellationToken</code> transmis jusqu'à <code>ExecuteReaderAsync(ct)</code>. Dans une API, si le client ferme la requête, la requête SQL est annulée au lieu de tourner pour rien.</li>
<li><strong>Une connexion par opération</strong>, ouverte le plus tard possible et fermée le plus tôt possible avec <code>await using</code>. Le pool de connexions (jour 22) rend l'ouverture quasi gratuite.</li>
<li><strong>Paramètres typés</strong> : <code>Parameters.Add("@Id", SqlDbType.Int)</code>, jamais de concaténation.</li>
<li><strong>Mapping centralisé</strong> : une méthode privée <code>Map(SqlDataReader)</code> par type, avec les ordinaux récupérés une fois (<code>reader.GetOrdinal("Price")</code>).</li>
<li><strong>Le repository ne décide pas de la logique métier</strong> : il lit et écrit. Vérifier qu'un client peut commander, c'est le rôle d'un service.</li>
<li><strong>Retour explicite de l'absence</strong> : <code>Task&lt;Product?&gt;</code> pour une recherche par Id, plutôt qu'une exception.</li>
</ul>

<h3>Une factory de connexions</h3>
<p>Plutôt que de passer la chaîne de connexion partout, on crée une petite abstraction <code>IDbConnectionFactory</code> enregistrée en singleton dans la DI. Elle lit la chaîne de connexion une fois dans la configuration et fabrique des <code>SqlConnection</code> à la demande. Les repositories la reçoivent par constructeur. Avantages : la configuration est à un seul endroit, et les tests d'intégration peuvent fournir une factory qui pointe vers une base de test.</p>
<p>Attention : la factory est un <em>singleton</em>, mais elle ne garde <strong>aucune</strong> connexion ouverte. Une <code>SqlConnection</code> n'est pas thread-safe et ne doit jamais être partagée entre requêtes.</p>

<h3>Tests d'intégration</h3>
<p>Un repository ne se teste pas avec des mocks : ce qui peut casser, c'est le SQL lui-même (faute de frappe dans une colonne, mauvais type, jointure fausse). On le teste donc contre une <strong>vraie base SQL Server</strong>, par exemple celle de ton conteneur Docker, avec une base dédiée <code>OrderFlowTests</code>. Chaque test prépare ses données, exécute la méthode et vérifie le résultat. Pour que les tests ne se polluent pas entre eux, une technique simple consiste à ouvrir un <code>TransactionScope</code> au début du test et à ne jamais appeler <code>Complete()</code> : tout est annulé à la fin. Au module tests, tu automatiseras le démarrage de la base avec Testcontainers.</p>

<h3>Dapper : un micro-ORM au-dessus d'ADO.NET</h3>
<p>En écrivant le repository ADO.NET, tu remarques que 70 % du code est répétitif : créer les paramètres, boucler sur le reader, appeler <code>GetInt32</code>, <code>GetString</code>… <strong>Dapper</strong>, créé par l'équipe de Stack Overflow, supprime cette répétition. C'est une bibliothèque de méthodes d'extension sur <code>IDbConnection</code> : tu écris toujours ton SQL, mais Dapper crée les paramètres à partir d'un objet et mappe les colonnes vers tes propriétés par nom.</p>
<pre><code>dotnet add package Dapper</code></pre>
<table>
<thead><tr><th>Méthode</th><th>Équivalent ADO.NET</th><th>Usage</th></tr></thead>
<tbody>
<tr><td><code>QueryAsync&lt;T&gt;(sql, param)</code></td><td><code>ExecuteReaderAsync</code> + boucle + mapping</td><td>liste de lignes</td></tr>
<tr><td><code>QuerySingleOrDefaultAsync&lt;T&gt;</code></td><td>reader + une ligne au plus</td><td>recherche par clé ; lève une exception s'il y a plus d'une ligne</td></tr>
<tr><td><code>QueryFirstOrDefaultAsync&lt;T&gt;</code></td><td>reader + première ligne</td><td>« la plus récente », avec un <code>ORDER BY</code></td></tr>
<tr><td><code>ExecuteAsync</code></td><td><code>ExecuteNonQueryAsync</code></td><td>INSERT, UPDATE, DELETE ; renvoie le nombre de lignes</td></tr>
<tr><td><code>ExecuteScalarAsync&lt;T&gt;</code></td><td><code>ExecuteScalarAsync</code></td><td>une valeur (Id créé, COUNT)</td></tr>
<tr><td><code>QueryMultipleAsync</code></td><td>reader + <code>NextResultAsync</code></td><td>plusieurs <code>SELECT</code> en un aller-retour</td></tr>
</tbody>
</table>
<p>Les paramètres se passent avec un objet anonyme : <code>new { Id = id, MinPrice = 10m }</code>. Dapper crée <code>@Id</code> et <code>@MinPrice</code>, toujours sous forme de paramètres SQL : <strong>pas d'injection possible</strong> tant que tu n'interpoles pas de valeurs dans la chaîne SQL elle-même. Passer une liste (<code>new { Ids = ids }</code> avec <code>WHERE Id IN @Ids</code>) est aussi géré : Dapper déplie la liste en <code>@Ids1, @Ids2, ...</code>.</p>
<p>Deux précisions de typage : pour les chaînes, Dapper envoie du <code>NVARCHAR</code> par défaut, et pour une colonne <code>VARCHAR</code> indexée, cela peut empêcher l'utilisation de l'index (conversion implicite). On utilise alors <code>new DbString { Value = sku, IsAnsi = true, Length = 50 }</code>. Et le mapping se fait par <strong>nom de colonne</strong> : utilise des alias SQL (<code>SELECT unit_price AS UnitPrice</code>) si les noms diffèrent.</p>

<h3>Multi-mapping : charger un agrégat</h3>
<p>Pour charger une commande avec ses lignes, une jointure renvoie une ligne par <code>OrderLine</code>, avec les colonnes de la commande répétées. Le multi-mapping de Dapper découpe chaque ligne en deux objets grâce au paramètre <code>splitOn</code> : le nom de la colonne où commence le second objet (par défaut <code>Id</code>). À toi ensuite de regrouper les lignes sous la bonne commande avec un dictionnaire. L'alternative est <code>QueryMultipleAsync</code> : deux <code>SELECT</code> séparés (la commande, puis ses lignes) dans un seul aller-retour, sans données dupliquées. C'est souvent plus simple et plus efficace.</p>

<h3>Transactions avec Dapper</h3>
<p>Rien de nouveau : Dapper travaille sur ta connexion et accepte un paramètre <code>transaction:</code> sur chaque méthode. Le piège est le même qu'en ADO.NET : oublier de passer la transaction à un appel.</p>

<h3>ADO.NET, Dapper ou EF Core ?</h3>
<table>
<thead><tr><th>Critère</th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr></thead>
<tbody>
<tr><td>Performance brute</td><td>maximale</td><td>quasi identique à ADO.NET</td><td>très bonne en .NET 10, un peu plus de surcoût (tracking, traduction LINQ)</td></tr>
<tr><td>Productivité</td><td>faible : beaucoup de code répétitif</td><td>bonne pour les lectures</td><td>maximale : CRUD, relations, migrations</td></tr>
<tr><td>Contrôle du SQL</td><td>total</td><td>total (tu écris le SQL)</td><td>SQL généré ; SQL brut possible au besoin</td></tr>
<tr><td>Suivi des modifications</td><td>non</td><td>non</td><td>oui (change tracker)</td></tr>
<tr><td>Schéma et migrations</td><td>scripts à la main</td><td>scripts à la main</td><td>migrations générées depuis le modèle</td></tr>
<tr><td>Typage des requêtes</td><td>chaînes SQL</td><td>chaînes SQL</td><td>LINQ vérifié par le compilateur</td></tr>
<tr><td>Cas d'usage typiques</td><td>bulk copy, outils bas niveau, legacy</td><td>lectures complexes, rapports, base existante avec procédures stockées</td><td>applications métier, écritures avec règles, modèle riche</td></tr>
</tbody>
</table>
<p>En pratique, beaucoup d'équipes combinent : EF Core pour les écritures et le CRUD, Dapper pour quelques requêtes de lecture lourdes ou de reporting, <code>SqlBulkCopy</code> pour les imports. Les trois partagent la même <code>SqlConnection</code> sous le capot.</p>

<div class="note">Le vrai critère n'est pas la performance : sur une API classique, la différence entre Dapper et EF Core est de quelques microsecondes, alors que la requête SQL et le réseau prennent des millisecondes. Ce qui fait la différence, c'est la qualité du SQL exécuté (index, nombre de requêtes, colonnes ramenées). Un senior choisit l'outil qui rend ce SQL <strong>visible et maîtrisé</strong> pour son équipe, et mesure avant d'optimiser.</div>

<h3>Pièges courants</h3>
<ul>
<li>Partager une <code>SqlConnection</code> entre plusieurs requêtes HTTP (singleton) : erreurs aléatoires sous charge.</li>
<li>Oublier de transmettre le <code>CancellationToken</code> : Dapper l'accepte via <code>new CommandDefinition(sql, param, cancellationToken: ct)</code>.</li>
<li>Utiliser <code>QuerySingleAsync</code> quand la ligne peut ne pas exister : exception. Prends <code>QuerySingleOrDefaultAsync</code>.</li>
<li>Construire le SQL Dapper avec une interpolation <code>$"... WHERE Name = '{name}'"</code> : l'injection SQL revient.</li>
<li>Colonne SQL et propriété C# de noms différents : Dapper laisse la propriété à sa valeur par défaut, sans erreur.</li>
<li>Multi-mapping sans <code>splitOn</code> correct : le second objet est mal rempli ou <code>null</code>.</li>
</ul>
`,
  examples: [
    {
      title: "IDbConnectionFactory et enregistrement dans la DI",
      code: `using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public interface IDbConnectionFactory
{
    // DbConnection (et non IDbConnection) pour avoir les méthodes async
    DbConnection Create();
}

public sealed class SqlConnectionFactory(string connectionString) : IDbConnectionFactory
{
    public DbConnection Create() => new SqlConnection(connectionString); // une nouvelle connexion à chaque appel
}

public static class DataServiceCollectionExtensions
{
    public static IServiceCollection AddOrderFlowAdo(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("OrderFlow")
                 ?? throw new InvalidOperationException("ConnectionStrings:OrderFlow manquante.");

        services.AddSingleton<IDbConnectionFactory>(new SqlConnectionFactory(cs)); // sans état : singleton OK
        services.AddScoped<IProductRepository, AdoProductRepository>();
        return services;
    }
}

// Dans Program.cs d'une API (module APIs) :
// builder.Services.AddOrderFlowAdo(builder.Configuration);
//
// appsettings.Development.json :
// { "ConnectionStrings": { "OrderFlow": "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=...;TrustServerCertificate=True" } }`,
      explain: "La factory est un singleton car elle ne contient qu'une chaîne de caractères. Les connexions, elles, sont créées et disposées à chaque opération. En production, la chaîne de connexion vient des secrets ou d'Azure Key Vault, jamais du code."
    },
    {
      title: "ProductRepository en ADO.NET",
      code: `using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;

public sealed record Product(int Id, string Name, string Sku, decimal Price, int Stock);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> SearchAsync(string? nameContains, int page, int pageSize, CancellationToken ct = default);
    Task<int> AddAsync(Product product, CancellationToken ct = default);
    Task<bool> UpdatePriceAsync(int id, decimal price, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public sealed class AdoProductRepository(IDbConnectionFactory factory) : IProductRepository
{
    private const string Columns = "Id, Name, Sku, Price, Stock";

    public async Task<Product?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = $"SELECT {Columns} FROM dbo.Products WHERE Id = @Id;"; // seule une constante est interpolée
        AddParameter(cmd, "@Id", DbType.Int32, id);

        await connection.OpenAsync(ct);
        await using var reader = await cmd.ExecuteReaderAsync(CommandBehavior.SingleRow, ct);
        return await reader.ReadAsync(ct) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(string? nameContains, int page, int pageSize, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = $"""
            SELECT {Columns} FROM dbo.Products
            WHERE @Name IS NULL OR Name LIKE N'%' + @Name + N'%'
            ORDER BY Name
            OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;
            """;
        AddParameter(cmd, "@Name", DbType.String, nameContains);
        AddParameter(cmd, "@Skip", DbType.Int32, (page - 1) * pageSize);
        AddParameter(cmd, "@Take", DbType.Int32, pageSize);

        await connection.OpenAsync(ct);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        var products = new List<Product>();
        while (await reader.ReadAsync(ct))
            products.Add(Map(reader));
        return products;
    }

    public async Task<int> AddAsync(Product product, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = "INSERT INTO dbo.Products (Name, Sku, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, @Sku, @Price, @Stock);";
        AddParameter(cmd, "@Name", DbType.String, product.Name);
        AddParameter(cmd, "@Sku", DbType.String, product.Sku);
        AddParameter(cmd, "@Price", DbType.Decimal, product.Price);
        AddParameter(cmd, "@Stock", DbType.Int32, product.Stock);

        await connection.OpenAsync(ct);
        return (int)(await cmd.ExecuteScalarAsync(ct))!;
    }

    public async Task<bool> UpdatePriceAsync(int id, decimal price, CancellationToken ct = default) =>
        await ExecuteAsync("UPDATE dbo.Products SET Price = @Price WHERE Id = @Id;", ct,
            ("@Price", DbType.Decimal, price), ("@Id", DbType.Int32, id)) == 1;

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default) =>
        await ExecuteAsync("DELETE FROM dbo.Products WHERE Id = @Id;", ct, ("@Id", DbType.Int32, id)) == 1;

    private async Task<int> ExecuteAsync(string sql, CancellationToken ct, params (string Name, DbType Type, object? Value)[] parameters)
    {
        await using var connection = factory.Create();
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = sql;
        foreach (var (name, type, value) in parameters)
            AddParameter(cmd, name, type, value);
        await connection.OpenAsync(ct);
        return await cmd.ExecuteNonQueryAsync(ct);
    }

    private static void AddParameter(DbCommand cmd, string name, DbType type, object? value)
    {
        var p = cmd.CreateParameter();
        p.ParameterName = name;
        p.DbType = type;
        p.Value = value ?? DBNull.Value; // null C# -> NULL SQL
        cmd.Parameters.Add(p);
    }

    private static Product Map(DbDataReader r) => new(
        r.GetInt32(r.GetOrdinal("Id")),
        r.GetString(r.GetOrdinal("Name")),
        r.GetString(r.GetOrdinal("Sku")),
        r.GetDecimal(r.GetOrdinal("Price")),
        r.GetInt32(r.GetOrdinal("Stock")));
}`,
      explain: "Le repository travaille avec les types abstraits <code>DbConnection</code>, <code>DbCommand</code> et <code>DbDataReader</code> : seule la factory connaît SQL Server. Compte les lignes : environ 100 pour cinq méthodes simples. Garde ce chiffre en tête pour la version Dapper."
    },
    {
      title: "Test d'intégration du repository",
      code: `using System.Transactions;
using Xunit;

// dotnet add package xunit ; dotnet add package xunit.runner.visualstudio ; dotnet add package Microsoft.NET.Test.Sdk
// Base de test : OrderFlowTests, avec le même schéma que OrderFlow.
public sealed class AdoProductRepositoryTests : IDisposable
{
    private const string TestConnectionString =
        "Server=localhost,1433;Database=OrderFlowTests;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";

    // Transaction ambiante jamais validée : tout ce que le test écrit est annulé au Dispose
    private readonly TransactionScope _scope = new(TransactionScopeAsyncFlowOption.Enabled);
    private readonly AdoProductRepository _repository = new(new SqlConnectionFactory(TestConnectionString));

    [Fact]
    public async Task AddAsync_then_GetByIdAsync_returns_the_same_product()
    {
        var id = await _repository.AddAsync(new Product(0, "Casque audio", "HS-100", 59.90m, 12));

        var product = await _repository.GetByIdAsync(id);

        Assert.NotNull(product);
        Assert.Equal("HS-100", product.Sku);
        Assert.Equal(59.90m, product.Price);
    }

    [Fact]
    public async Task GetByIdAsync_returns_null_when_product_does_not_exist()
    {
        Assert.Null(await _repository.GetByIdAsync(-1));
    }

    [Fact]
    public async Task UpdatePriceAsync_returns_false_for_unknown_product()
    {
        Assert.False(await _repository.UpdatePriceAsync(-1, 10m));
    }

    [Fact]
    public async Task SearchAsync_filters_by_name_and_paginates()
    {
        for (var i = 0; i < 5; i++)
            await _repository.AddAsync(new Product(0, $"TestSearch {i}", $"TS-{i}", 10m, 1));

        var page2 = await _repository.SearchAsync("TestSearch", page: 2, pageSize: 2);

        Assert.Equal(["TestSearch 2", "TestSearch 3"], page2.Select(p => p.Name));
    }

    public void Dispose() => _scope.Dispose(); // pas de Complete() : rollback
}`,
      explain: "Chaque connexion ouverte par le repository s'inscrit dans la transaction ambiante du test, puis tout est annulé au <code>Dispose</code>. La base de test reste propre et les tests sont indépendants. Ces tests vérifient le vrai SQL, ce qu'aucun mock ne ferait."
    },
    {
      title: "Dapper : le même repository en quelques lignes",
      code: `using System.Data;
using Dapper;

// dotnet add package Dapper
public sealed class DapperProductRepository(IDbConnectionFactory factory) : IProductRepository
{
    private const string Columns = "Id, Name, Sku, Price, Stock";

    public async Task<Product?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        await using var connection = factory.Create(); // Dapper ouvre la connexion si elle est fermée
        return await connection.QuerySingleOrDefaultAsync<Product>(
            new CommandDefinition($"SELECT {Columns} FROM dbo.Products WHERE Id = @Id;", new { Id = id }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(string? nameContains, int page, int pageSize, CancellationToken ct = default)
    {
        const string sql = $"""
            SELECT {Columns} FROM dbo.Products
            WHERE @Name IS NULL OR Name LIKE N'%' + @Name + N'%'
            ORDER BY Name
            OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;
            """;
        await using var connection = factory.Create();
        var rows = await connection.QueryAsync<Product>(new CommandDefinition(sql,
            new { Name = nameContains, Skip = (page - 1) * pageSize, Take = pageSize }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<int> AddAsync(Product product, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        // Les propriétés de product deviennent @Name, @Sku, @Price, @Stock
        return await connection.ExecuteScalarAsync<int>(new CommandDefinition(
            "INSERT INTO dbo.Products (Name, Sku, Price, Stock) OUTPUT INSERTED.Id VALUES (@Name, @Sku, @Price, @Stock);",
            product, cancellationToken: ct));
    }

    public async Task<bool> UpdatePriceAsync(int id, decimal price, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        return await connection.ExecuteAsync(new CommandDefinition(
            "UPDATE dbo.Products SET Price = @Price WHERE Id = @Id;", new { Id = id, Price = price }, cancellationToken: ct)) == 1;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        return await connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM dbo.Products WHERE Id = @Id;", new { Id = id }, cancellationToken: ct)) == 1;
    }

    // Bonus : une liste d'Ids, dépliée automatiquement par Dapper en @Ids1, @Ids2, ...
    public async Task<IReadOnlyList<Product>> GetManyAsync(IEnumerable<int> ids, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        var rows = await connection.QueryAsync<Product>(new CommandDefinition(
            $"SELECT {Columns} FROM dbo.Products WHERE Id IN @Ids;", new { Ids = ids }, cancellationToken: ct));
        return rows.AsList();
    }
}

// Pour basculer, une seule ligne change dans la DI :
// services.AddScoped<IProductRepository, DapperProductRepository>();`,
      explain: "Le SQL est identique à la version ADO.NET, mais le code autour a disparu. Dapper mappe les colonnes vers le constructeur du record <code>Product</code> par nom. <code>CommandDefinition</code> sert à transmettre le <code>CancellationToken</code>. Les tests d'intégration de l'exemple précédent passent sans changement avec cette implémentation."
    },
    {
      title: "Charger une commande et ses lignes : multi-mapping, QueryMultiple et transaction",
      code: `using System.Data;
using Dapper;

public sealed class OrderLine
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
}

public sealed class Order
{
    public int Id { get; init; }
    public int CustomerId { get; init; }
    public DateTime CreatedAt { get; init; }
    public decimal Total { get; init; }
    public List<OrderLine> Lines { get; } = [];
}

public sealed class DapperOrderRepository(IDbConnectionFactory factory)
{
    // Version 1 : une jointure, Dapper découpe chaque ligne en Order + OrderLine
    public async Task<Order?> GetWithJoinAsync(int orderId)
    {
        const string sql = """
            SELECT o.Id, o.CustomerId, o.CreatedAt, o.Total,
                   l.Id, l.ProductId, l.Quantity, l.UnitPrice
            FROM dbo.Orders o
            LEFT JOIN dbo.OrderLines l ON l.OrderId = o.Id
            WHERE o.Id = @OrderId;
            """;
        await using var connection = factory.Create();
        Order? result = null;
        await connection.QueryAsync<Order, OrderLine?, Order>(sql,
            (order, line) =>
            {
                result ??= order;                 // la commande est répétée sur chaque ligne : on garde la première
                if (line is not null) result.Lines.Add(line);
                return result;
            },
            new { OrderId = orderId },
            splitOn: "Id");                       // le 2e "Id" (celui de OrderLines) commence le second objet
        return result;
    }

    // Version 2 : deux SELECT en un aller-retour, sans données dupliquées
    public async Task<Order?> GetWithQueryMultipleAsync(int orderId)
    {
        const string sql = """
            SELECT Id, CustomerId, CreatedAt, Total FROM dbo.Orders WHERE Id = @OrderId;
            SELECT Id, ProductId, Quantity, UnitPrice FROM dbo.OrderLines WHERE OrderId = @OrderId ORDER BY Id;
            """;
        await using var connection = factory.Create();
        await using var grid = await connection.QueryMultipleAsync(sql, new { OrderId = orderId });
        var order = await grid.ReadSingleOrDefaultAsync<Order>();
        if (order is null) return null;
        order.Lines.AddRange(await grid.ReadAsync<OrderLine>());
        return order;
    }

    // Transaction : chaque appel Dapper reçoit transaction: tx
    public async Task<int> CreateAsync(int customerId, IReadOnlyList<(int ProductId, int Quantity, decimal UnitPrice)> lines)
    {
        await using var connection = factory.Create();
        await connection.OpenAsync();
        await using var tx = await connection.BeginTransactionAsync();
        try
        {
            var total = lines.Sum(l => l.Quantity * l.UnitPrice);
            var orderId = await connection.ExecuteScalarAsync<int>(
                "INSERT INTO dbo.Orders (CustomerId, CreatedAt, Status, Total) OUTPUT INSERTED.Id VALUES (@CustomerId, SYSUTCDATETIME(), N'Pending', @Total);",
                new { CustomerId = customerId, Total = total }, transaction: tx);

            // Une liste d'objets : Dapper exécute l'INSERT une fois par élément
            await connection.ExecuteAsync(
                "INSERT INTO dbo.OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES (@OrderId, @ProductId, @Quantity, @UnitPrice);",
                lines.Select(l => new { OrderId = orderId, l.ProductId, l.Quantity, l.UnitPrice }), transaction: tx);

            await tx.CommitAsync();
            return orderId;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}`,
      explain: "Avec le <code>LEFT JOIN</code>, une commande sans ligne renvoie des colonnes de ligne à <code>NULL</code> : Dapper passe alors <code>null</code> pour <code>line</code>. Passer une collection à <code>ExecuteAsync</code> exécute l'instruction une fois par élément : c'est pratique, mais ce n'est pas un bulk. Au-delà de quelques centaines de lignes, utilise <code>SqlBulkCopy</code> ou un TVP."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "CustomerRepository avec Dapper",
      prompt: "<p>Écris un <code>ICustomerRepository</code> et son implémentation Dapper avec trois méthodes : <code>GetByEmailAsync(string email)</code> (renvoie <code>Customer?</code>), <code>ListAsync()</code> triée par nom, et <code>AddAsync(Customer customer)</code> qui renvoie l'Id créé. Utilise l'<code>IDbConnectionFactory</code> de l'exemple 1.</p>",
      hint: "<p><code>QuerySingleOrDefaultAsync&lt;Customer&gt;</code>, <code>QueryAsync&lt;Customer&gt;</code> et <code>ExecuteScalarAsync&lt;int&gt;</code> avec <code>OUTPUT INSERTED.Id</code>. L'objet <code>customer</code> peut servir directement de paramètre.</p>",
      solution: `using Dapper;

public sealed record Customer(int Id, string Name, string Email);

public interface ICustomerRepository
{
    Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<Customer>> ListAsync(CancellationToken ct = default);
    Task<int> AddAsync(Customer customer, CancellationToken ct = default);
}

public sealed class DapperCustomerRepository(IDbConnectionFactory factory) : ICustomerRepository
{
    public async Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        return await connection.QuerySingleOrDefaultAsync<Customer>(new CommandDefinition(
            "SELECT Id, Name, Email FROM dbo.Customers WHERE Email = @Email;", new { Email = email }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<Customer>> ListAsync(CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        var rows = await connection.QueryAsync<Customer>(new CommandDefinition(
            "SELECT Id, Name, Email FROM dbo.Customers ORDER BY Name;", cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<int> AddAsync(Customer customer, CancellationToken ct = default)
    {
        await using var connection = factory.Create();
        return await connection.ExecuteScalarAsync<int>(new CommandDefinition(
            "INSERT INTO dbo.Customers (Name, Email) OUTPUT INSERTED.Id VALUES (@Name, @Email);",
            customer, cancellationToken: ct));
    }
}

// Utilisation
// var repo = new DapperCustomerRepository(new SqlConnectionFactory(cs));
// var id = await repo.AddAsync(new Customer(0, "Alice", "alice@example.com"));
// Console.WriteLine(await repo.GetByEmailAsync("alice@example.com"));`
    },
    {
      level: "moyen",
      title: "Tableau de bord en un seul aller-retour",
      prompt: "<p>Écris une méthode <code>GetDashboardAsync()</code> qui renvoie un record <code>Dashboard</code> contenant : le nombre total de commandes, le chiffre d'affaires du mois en cours, les 5 produits les plus vendus (nom + quantité) et les 5 produits dont le stock est inférieur à 10. Le tout doit être chargé en <strong>une seule requête réseau</strong>.</p>",
      hint: "<p><code>QueryMultipleAsync</code> avec quatre <code>SELECT</code> séparés par des points-virgules, puis <code>ReadSingleAsync&lt;int&gt;</code>, <code>ReadSingleAsync&lt;decimal&gt;</code> et deux <code>ReadAsync&lt;T&gt;</code>, dans l'ordre. Pour le début du mois : <code>DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1)</code>.</p>",
      solution: `using Dapper;

public sealed record TopProduct(string Name, int QuantitySold);
public sealed record LowStockProduct(string Name, int Stock);
public sealed record Dashboard(int OrderCount, decimal RevenueThisMonth, IReadOnlyList<TopProduct> TopProducts, IReadOnlyList<LowStockProduct> LowStock);

public sealed class DashboardReader(IDbConnectionFactory factory)
{
    public async Task<Dashboard> GetDashboardAsync(CancellationToken ct = default)
    {
        const string sql = """
            SELECT COUNT(*) FROM dbo.Orders;

            SELECT ISNULL(SUM(Total), 0) FROM dbo.Orders
            WHERE CreatedAt >= DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1);

            SELECT TOP (5) p.Name, SUM(l.Quantity) AS QuantitySold
            FROM dbo.OrderLines l JOIN dbo.Products p ON p.Id = l.ProductId
            GROUP BY p.Name
            ORDER BY QuantitySold DESC;

            SELECT TOP (5) Name, Stock FROM dbo.Products WHERE Stock < 10 ORDER BY Stock;
            """;

        await using var connection = factory.Create();
        await using var grid = await connection.QueryMultipleAsync(new CommandDefinition(sql, cancellationToken: ct));

        // Lecture dans le même ordre que les SELECT
        var orderCount = await grid.ReadSingleAsync<int>();
        var revenue = await grid.ReadSingleAsync<decimal>();
        var top = (await grid.ReadAsync<TopProduct>()).AsList();
        var lowStock = (await grid.ReadAsync<LowStockProduct>()).AsList();

        return new Dashboard(orderCount, revenue, top, lowStock);
    }
}`
    },
    {
      level: "difficile",
      title: "Comparer les trois implémentations",
      prompt: "<p>Écris un programme console qui, sur une base contenant au moins 10 000 produits, mesure avec <code>Stopwatch</code> le temps moyen de 1 000 appels à <code>GetByIdAsync</code> (Ids aléatoires) et de 100 appels à <code>SearchAsync(\"Produit 1\", 1, 50)</code> pour <code>AdoProductRepository</code> et <code>DapperProductRepository</code>. Fais un tour d'échauffement non mesuré avant chaque série. Affiche un tableau des résultats et compte les lignes de code de chaque implémentation. Rédige en commentaire ta conclusion : laquelle choisirais-tu, et pourquoi ?</p>",
      hint: "<p>Écris une fonction <code>Measure(string label, int iterations, Func&lt;int, Task&gt; action)</code> qui fait l'échauffement puis la mesure. Utilise <code>Random.Shared.Next(1, maxId)</code> pour les Ids. Tu dois obtenir des écarts de quelques microsecondes : c'est la conclusion attendue.</p>",
      solution: `using System.Diagnostics;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True";
var factory = new SqlConnectionFactory(cs);

IProductRepository[] repositories = [new AdoProductRepository(factory), new DapperProductRepository(factory)];
const int maxId = 10_000;

Console.WriteLine($"{"Implémentation",-28} {"GetById (µs)",14} {"Search (µs)",14}");
foreach (var repo in repositories)
{
    var getById = await Measure(1_000, _ => repo.GetByIdAsync(Random.Shared.Next(1, maxId)));
    var search = await Measure(100, _ => repo.SearchAsync("Produit 1", 1, 50));
    Console.WriteLine($"{repo.GetType().Name,-28} {getById,14:F0} {search,14:F0}");
}

static async Task<double> Measure<T>(int iterations, Func<int, Task<T>> action)
{
    for (var i = 0; i < 20; i++) await action(i); // échauffement : pool de connexions, JIT, plan SQL en cache

    var sw = Stopwatch.StartNew();
    for (var i = 0; i < iterations; i++) await action(i);
    sw.Stop();
    return sw.Elapsed.TotalMicroseconds / iterations; // temps moyen par appel
}

/* Conclusion (à adapter à tes mesures) :
   - Les temps ADO.NET et Dapper sont très proches : l'écart (quelques µs) est négligeable devant
     le temps de la requête SQL et du réseau (des centaines de µs, voire des ms).
   - La version ADO.NET fait environ 100 lignes, la version Dapper environ 50, avec le même SQL.
   - Choix : Dapper pour ce repository de lecture, car il est deux fois plus court pour la même performance
     et le même contrôle du SQL. ADO.NET brut reste réservé aux cas où Dapper ne suffit pas
     (SqlBulkCopy, streaming très fin). EF Core, vu au module suivant, sera préférable pour les écritures
     avec des relations et des règles métier.
   - Ce test n'est pas un benchmark rigoureux : BenchmarkDotNet donnera des chiffres fiables. */`
    }
  ],
  project: `<p>Finalise <code>OrderFlow.Data.Ado</code> :</p>
<ul>
<li>Ajoute <code>IDbConnectionFactory</code>, <code>SqlConnectionFactory</code> et la méthode d'extension <code>AddOrderFlowAdo</code>.</li>
<li>Implémente <code>IProductRepository</code> deux fois : <code>AdoProductRepository</code> et <code>DapperProductRepository</code>.</li>
<li>Ajoute <code>DapperOrderRepository</code> avec <code>GetWithQueryMultipleAsync</code> et <code>CreateAsync</code> transactionnel.</li>
<li>Crée un projet de tests <code>OrderFlow.Data.Ado.Tests</code> (xUnit) qui exécute <strong>les mêmes tests</strong> sur les deux implémentations de <code>IProductRepository</code> (un <code>[Theory]</code> avec les deux types en paramètre, ou une classe de base abstraite).</li>
<li>Dans le <code>README</code> du projet, note en cinq lignes ta comparaison ADO.NET / Dapper (lignes de code, temps mesurés, lisibilité). Tu la compléteras avec EF Core à la fin du module suivant.</li>
</ul>`,
  resources: [
    { label: "Dapper (dépôt officiel et documentation)", url: "https://github.com/DapperLib/Dapper" },
    { label: "Récupérer des données avec un DataReader", url: "https://learn.microsoft.com/dotnet/framework/data/adonet/retrieving-data-using-a-datareader" },
    { label: "Programmation asynchrone avec SqlClient", url: "https://learn.microsoft.com/sql/connect/ado-net/asynchronous-programming" },
    { label: "Introduction à Microsoft.Data.SqlClient", url: "https://learn.microsoft.com/sql/connect/ado-net/introduction-microsoft-data-sqlclient-namespace" },
    { label: "Tests unitaires en C# avec xUnit", url: "https://learn.microsoft.com/dotnet/core/testing/unit-testing-csharp-with-xunit" }
  ]
});
