window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 4 · Sécurité et services externes
// 4.x S'authentifier avec un jeton JWT
// =====================================================================
window.COURSE.push({
  key: "api-auth-jwt",
  title: "S'authentifier avec un jeton JWT",
  summary: "Tu sauras protéger un endpoint, fabriquer un jeton JWT au login et lire l'identité de l'utilisateur dans ton API.",
  objectives: [
    "Distinguer authentification et autorisation",
    "Comprendre ce que contient un jeton JWT et pourquoi on peut lui faire confiance",
    "Configurer AddJwtBearer et protéger un endpoint avec RequireAuthorization",
    "Lire les claims de l'utilisateur connecté avec ClaimsPrincipal"
  ],
  analogy: `<p>Imagine un festival. À l'entrée, on vérifie ta pièce d'identité <strong>une seule fois</strong>, puis on te pose un <strong>bracelet</strong> infalsifiable avec ton nom et ta catégorie (visiteur, artiste, staff) et une date de fin.</p>
<p>Ensuite, à chaque stand, personne ne revérifie ta carte d'identité : on regarde juste ton bracelet. Le login, c'est le contrôle d'identité. Le <strong>jeton JWT</strong>, c'est le bracelet. Et comme le bracelet a un sceau que seul l'organisateur sait poser, on ne peut pas en fabriquer un faux.</p>`,
  lesson: `<h3>Authentification ou autorisation ?</h3>
<p>Deux mots se ressemblent mais ne disent pas la même chose. L'<strong>authentification</strong> répond à « <em>qui es-tu ?</em> » : on vérifie l'identité de celui qui appelle. L'<strong>autorisation</strong> répond à « <em>as-tu le droit ?</em> » : on décide si cette personne peut faire cette action. Cette leçon traite la première, la suivante la seconde.</p>
<p>Côté HTTP, les deux ont leur code d'erreur. <code>401 Unauthorized</code> veut dire « je ne sais pas qui tu es » (malgré son nom, c'est bien un problème d'authentification). <code>403 Forbidden</code> veut dire « je sais qui tu es, mais c'est non ».</p>

<h3>Le principe du jeton</h3>
<p>Une API REST est <strong>sans état</strong> : elle ne se souvient pas des requêtes précédentes. Il faut donc que chaque requête prouve qui l'envoie. Le scénario classique se fait en trois temps.</p>
<div class="flow"><span>POST /login (email + mot de passe)</span><span>L'API renvoie un jeton</span><span>Chaque requête envoie Authorization: Bearer &lt;jeton&gt;</span><span>L'API vérifie le jeton</span></div>
<p>Tu connais déjà l'autre côté : dans Angular, un <strong>intercepteur HTTP</strong> ajoute l'en-tête <code>Authorization: Bearer …</code> à chaque appel. Ici, on écrit la partie serveur qui fabrique et vérifie ce jeton.</p>

<h3>Ce qu'il y a dans un JWT</h3>
<p>Un <strong>JWT</strong> (JSON Web Token, prononcé « jot ») est une chaîne en trois morceaux séparés par des points. Chaque morceau est encodé en Base64, ce qui le rend illisible à l'œil nu mais <strong>pas secret</strong> : n'importe qui peut le décoder.</p>
<pre class="diagram">
 eyJhbGciOi... . eyJzdWIiOi... . 3yuTHD4Dx6...
 |  EN-TÊTE  |   |  CONTENU  |   | SIGNATURE |
 {"alg":"HS256"} {"sub":"42",    calculée avec
                  "name":"Alice", la clé secrète
                  "role":"Admin", du serveur
                  "exp":179401..}
</pre>
<p>Le contenu (on dit le <em>payload</em>) contient des <strong>claims</strong> : des affirmations sur l'utilisateur, comme son identifiant (<code>sub</code>), son nom ou son rôle, plus la date d'expiration (<code>exp</code>). La <strong>signature</strong> est calculée avec une clé secrète que seul le serveur connaît. Si quelqu'un modifie une seule lettre du contenu, la signature ne correspond plus et l'API refuse le jeton.</p>
<div class="tip">Le contenu d'un JWT est lisible par tout le monde. N'y mets jamais de mot de passe ni de donnée sensible : seulement ce qui sert à identifier l'utilisateur et ses droits.</div>

<h3>La configuration côté ASP.NET Core</h3>
<p>Il faut le package <code>Microsoft.AspNetCore.Authentication.JwtBearer</code>. Ensuite, trois morceaux dans <code>Program.cs</code> :</p>
<table>
<tr><th>Code</th><th>Rôle</th></tr>
<tr><td><code>AddAuthentication().AddJwtBearer(…)</code></td><td>Enregistre le lecteur de jetons et ses règles de validation</td></tr>
<tr><td><code>app.UseAuthentication()</code></td><td>Middleware qui lit l'en-tête <code>Authorization</code> et remplit <code>HttpContext.User</code></td></tr>
<tr><td><code>.RequireAuthorization()</code></td><td>Marque un endpoint comme réservé aux utilisateurs connus</td></tr>
</table>
<p>Les règles de validation sont dans <code>TokenValidationParameters</code> : l'émetteur attendu (<code>Issuer</code>, qui a créé le jeton), le public attendu (<code>Audience</code>, pour qui il est fait) et la clé de signature. La date d'expiration est vérifiée automatiquement.</p>
<p>Les réglages vont dans <code>appsettings.json</code>, dans une section <code>"Jwt"</code> avec <code>Issuer</code>, <code>Audience</code> et <code>Key</code>. La clé doit faire au moins 32 caractères pour l'algorithme HS256.</p>
<div class="tip">En développement, garde la clé dans les <em>user secrets</em> (<code>dotnet user-secrets set "Jwt:Key" "…"</code>) plutôt que dans <code>appsettings.json</code> versionné. En production, elle vient d'une variable d'environnement ou d'un coffre-fort comme Azure Key Vault.</div>

<h3>Lire l'utilisateur dans un endpoint</h3>
<p>Une fois le jeton validé, ASP.NET Core construit un <code>ClaimsPrincipal</code> : un objet qui représente l'utilisateur et contient tous ses claims. Dans une Minimal API, il suffit d'ajouter un paramètre <code>ClaimsPrincipal user</code> au handler. <code>user.FindFirstValue("sub")</code> lit un claim, <code>user.Identity.Name</code> donne le nom et <code>user.IsInRole("Admin")</code> teste un rôle.</p>
<div class="compare"><div><h4>Angular</h4><p>Tu stockes le jeton, un intercepteur l'ajoute aux requêtes, et tu décodes parfois le payload pour afficher le nom.</p></div><div><h4>ASP.NET Core</h4><p>Le middleware vérifie la signature et l'expiration, puis te donne un <code>ClaimsPrincipal</code> déjà rempli.</p></div></div>
<div class="note">Un JWT ne peut pas être révoqué : tant qu'il n'a pas expiré, il reste valide. En production, on donne une durée de vie courte au jeton d'accès (5 à 30 minutes) et on utilise un <em>refresh token</em> pour en obtenir un nouveau. Pour un vrai produit, on délègue souvent tout cela à un fournisseur d'identité (Microsoft Entra ID, Auth0, Keycloak) plutôt que d'écrire son propre login.</div>`,
  examples: [
    {
      title: "Protéger un endpoint",
      code: `// Fichier : Program.cs
// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
using System.Text;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var jwt = builder.Configuration.GetSection("Jwt");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.MapInboundClaims = false; // garde les noms courts : sub, name, role
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = key,
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/products", () => new[] { "Clavier", "Souris" });
app.MapGet("/api/orders", () => new[] { new { Id = 1, Status = "Pending" } })
   .RequireAuthorization();

app.Run();

// Test : curl -i http://localhost:5080/api/orders`,
      output: `HTTP/1.1 401 Unauthorized
Content-Length: 0
WWW-Authenticate: Bearer`,
      steps: [
        "<code>var jwt = builder.Configuration.GetSection(\"Jwt\");</code> : on lit la section <code>Jwt</code> de <code>appsettings.json</code> (Issuer, Audience, Key).",
        "<code>new SymmetricSecurityKey(…)</code> : on transforme la clé texte en clé de signature. « Symétrique » veut dire que la même clé sert à signer et à vérifier.",
        "<code>options.MapInboundClaims = false;</code> : par défaut, .NET renomme certains claims (<code>role</code> devient une longue URL). On garde les noms courts, plus lisibles.",
        "<code>TokenValidationParameters</code> : les règles. Un jeton d'un autre émetteur, pour un autre public ou mal signé sera refusé.",
        "<code>app.UseAuthentication();</code> puis <code>app.UseAuthorization();</code> : toujours dans cet ordre, d'abord savoir <em>qui</em>, ensuite décider.",
        "<code>.RequireAuthorization()</code> : <code>/api/orders</code> exige un jeton valide. <code>/api/products</code> reste public.",
        "Sortie : sans jeton, l'API répond <code>401</code> et l'en-tête <code>WWW-Authenticate: Bearer</code> indique le type de jeton attendu."
      ],
      explain: "Un appel à /api/products sans jeton répond toujours 200 avec [\"Clavier\",\"Souris\"] : seul l'endpoint marqué est protégé."
    },
    {
      title: "Fabriquer un jeton au login",
      code: `// Fichier : Program.cs (suite de l'exemple 1)
// En haut du fichier, avec les autres using :
using Microsoft.IdentityModel.JsonWebTokens;

// Avant app.Run() :

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    // Démo : un seul utilisateur codé en dur (une vraie app lit la base)
    if (request.Email != "alice@orderflow.dev" || request.Password != "Passw0rd!")
        return Results.Unauthorized();

    var descriptor = new SecurityTokenDescriptor
    {
        Issuer = jwt["Issuer"],
        Audience = jwt["Audience"],
        Expires = DateTime.UtcNow.AddMinutes(30),
        SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        Claims = new Dictionary<string, object>
        {
            ["sub"] = "42", ["name"] = "Alice", ["role"] = "Admin"
        }
    };
    var token = new JsonWebTokenHandler().CreateToken(descriptor);
    return Results.Ok(new { accessToken = token, expiresIn = 1800 });
});

// À la fin du fichier
record LoginRequest(string Email, string Password);

// Test : curl -i -X POST http://localhost:5080/api/auth/login
//   -H "Content-Type: application/json"
//   -d "{\\"email\\":\\"alice@orderflow.dev\\",\\"password\\":\\"Passw0rd!\\"}"`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJPcmRlckZsb3cuQ2xpZW50IiwiaXNzIjoiT3JkZXJGbG93IiwiZXhwIjoxNzk0MDEyNTQ0LCJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc5NDAxMDc0NCwibmJmIjoxNzk0MDEwNzQ0fQ.3yuTHD4Dx6ngxgr9Q3AQ3-nc7ZnxLGrNp0tnX6An5tU","expiresIn":1800}`,
      steps: [
        "<code>(LoginRequest request)</code> : le corps JSON de la requête est lu automatiquement dans le record <code>LoginRequest</code>.",
        "<code>return Results.Unauthorized();</code> : mauvais identifiants, on répond 401 sans dire si c'est l'email ou le mot de passe qui est faux (on ne donne pas d'indice à un attaquant).",
        "<code>Expires = DateTime.UtcNow.AddMinutes(30)</code> : le jeton expire dans 30 minutes. Toujours en UTC.",
        "<code>SigningCredentials = new SigningCredentials(key, …HmacSha256)</code> : on signe avec la <em>même</em> clé que celle utilisée pour la validation dans l'exemple 1.",
        "<code>Claims = new Dictionary…</code> : les informations rangées dans le jeton. <code>sub</code> est l'identifiant de l'utilisateur.",
        "<code>new JsonWebTokenHandler().CreateToken(descriptor)</code> : fabrique la chaîne <code>xxx.yyy.zzz</code>.",
        "Sortie : en décodant le deuxième morceau du jeton (sur jwt.io ou avec Base64), on lit <code>{\"aud\":\"OrderFlow.Client\",\"iss\":\"OrderFlow\",\"exp\":…,\"sub\":\"42\",\"name\":\"Alice\",\"role\":\"Admin\",…}</code>. Les nombres <code>exp</code>, <code>iat</code> et <code>nbf</code> changent à chaque appel."
      ],
      explain: "Avec un mauvais mot de passe, la même requête répond HTTP/1.1 401 Unauthorized."
    },
    {
      title: "Lire l'utilisateur connecté",
      code: `// Fichier : Program.cs (suite)
using System.Security.Claims; // en haut du fichier

// Avant app.Run() :

app.MapGet("/api/me", (ClaimsPrincipal user) => new
{
    Id = user.FindFirstValue("sub"),
    Name = user.Identity!.Name,
    IsAdmin = user.IsInRole("Admin")
}).RequireAuthorization();

// Test (remplace <jeton> par l'accessToken reçu au login) :
// curl -i http://localhost:5080/api/me -H "Authorization: Bearer <jeton>"`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"42","name":"Alice","isAdmin":true}`,
      steps: [
        "<code>(ClaimsPrincipal user)</code> : ASP.NET Core injecte l'utilisateur construit à partir du jeton. Pas besoin de décoder quoi que ce soit.",
        "<code>user.FindFirstValue(\"sub\")</code> : lit la valeur du claim <code>sub</code>, ici <code>\"42\"</code>. Renvoie <code>null</code> si le claim n'existe pas.",
        "<code>user.Identity!.Name</code> : utilise le claim déclaré dans <code>NameClaimType = \"name\"</code>.",
        "<code>user.IsInRole(\"Admin\")</code> : regarde le claim déclaré dans <code>RoleClaimType = \"role\"</code>.",
        "Si tu ajoutes une seule lettre à la fin du jeton, la signature ne correspond plus : réponse <code>401</code> avec <code>WWW-Authenticate: Bearer error=\"invalid_token\"</code>."
      ],
      explain: "Le jeton est vérifié à chaque requête, sans aucun accès à la base : c'est ce qui rend l'API sans état."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Protéger un endpoint de plus",
      prompt: `<p>Dans l'API de l'exemple 1, ajoute un endpoint <code>GET /api/customers</code> qui renvoie <code>new[] { "Alice", "Bob" }</code> et qui n'est accessible qu'avec un jeton valide. Teste-le avec et sans jeton.</p>`,
      hint: `<p>Il suffit d'ajouter <code>.RequireAuthorization()</code> après <code>MapGet</code>.</p>`,
      solution: `app.MapGet("/api/customers", () => new[] { "Alice", "Bob" })
   .RequireAuthorization();

// Sans jeton : HTTP/1.1 401 Unauthorized
// Avec jeton : HTTP/1.1 200 OK  ["Alice","Bob"]`
    },
    {
      level: "moyen",
      title: "Deux utilisateurs, deux rôles",
      prompt: `<p>Modifie le login pour accepter deux comptes : <code>alice@orderflow.dev</code> (rôle <code>Admin</code>, id 42) et <code>bob@orderflow.dev</code> (rôle <code>Customer</code>, id 7), avec le mot de passe <code>Passw0rd!</code>. Appelle <code>/api/me</code> avec le jeton de Bob : <code>isAdmin</code> doit valoir <code>false</code>.</p>`,
      hint: `<p>Range les comptes dans un dictionnaire <code>email → (Id, Name, Role)</code>, cherche l'email avec <code>TryGetValue</code>, puis utilise les valeurs trouvées dans les claims.</p>`,
      solution: `var users = new Dictionary<string, (string Id, string Name, string Role)>
{
    ["alice@orderflow.dev"] = ("42", "Alice", "Admin"),
    ["bob@orderflow.dev"] = ("7", "Bob", "Customer")
};

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    if (!users.TryGetValue(request.Email, out var u) || request.Password != "Passw0rd!")
        return Results.Unauthorized();

    var descriptor = new SecurityTokenDescriptor
    {
        Issuer = jwt["Issuer"],
        Audience = jwt["Audience"],
        Expires = DateTime.UtcNow.AddMinutes(30),
        SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        Claims = new Dictionary<string, object>
        {
            ["sub"] = u.Id, ["name"] = u.Name, ["role"] = u.Role
        }
    };
    return Results.Ok(new { accessToken = new JsonWebTokenHandler().CreateToken(descriptor) });
});
// /api/me avec le jeton de Bob : {"id":"7","name":"Bob","isAdmin":false}`
    },
    {
      level: "difficile",
      title: "Sortir la fabrication du jeton dans un service",
      prompt: `<p>Le handler de login fait trop de choses. Crée une classe <code>TokenService</code> avec une méthode <code>string CreateToken(string userId, string name, string role)</code>. Elle reçoit <code>IConfiguration</code> par son constructeur et lit la section <code>Jwt</code>. Enregistre-la dans la DI et injecte-la dans le handler de login.</p>`,
      hint: `<p>Utilise un constructeur principal : <code>public class TokenService(IConfiguration config)</code>. Enregistre-la avec <code>builder.Services.AddSingleton&lt;TokenService&gt;();</code> et ajoute <code>TokenService tokens</code> dans les paramètres du handler.</p>`,
      solution: `// Fichier : TokenService.cs
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

public class TokenService(IConfiguration config)
{
    public string CreateToken(string userId, string name, string role)
    {
        var jwt = config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = jwt["Issuer"],
            Audience = jwt["Audience"],
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
            Claims = new Dictionary<string, object>
            {
                ["sub"] = userId, ["name"] = name, ["role"] = role
            }
        };
        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}

// Fichier : Program.cs
// builder.Services.AddSingleton<TokenService>();
// app.MapPost("/api/auth/login", (LoginRequest request, TokenService tokens) =>
//     request.Email == "alice@orderflow.dev" && request.Password == "Passw0rd!"
//         ? Results.Ok(new { accessToken = tokens.CreateToken("42", "Alice", "Admin") })
//         : Results.Unauthorized());`
    }
  ],
  quiz: [
    {
      q: `Une requête arrive sans en-tête <code>Authorization</code> sur un endpoint marqué <code>.RequireAuthorization()</code>. Que répond l'API ?`,
      options: ["<code>403 Forbidden</code>", "<code>401 Unauthorized</code>", "<code>404 Not Found</code>"],
      answer: 1,
      why: `401 veut dire « je ne sais pas qui tu es » : aucun jeton n'a été fourni. 403 est réservé au cas où l'utilisateur est identifié mais n'a pas le droit.`
    },
    {
      q: `Pourquoi un attaquant ne peut-il pas changer <code>"role":"Customer"</code> en <code>"role":"Admin"</code> dans son jeton ?`,
      options: ["Parce que le contenu du jeton est chiffré", "Parce que la signature ne correspondrait plus", "Parce que le jeton est stocké en base de données"],
      answer: 1,
      why: `Le contenu est seulement encodé en Base64, donc lisible et modifiable. Mais la signature est calculée avec la clé secrète du serveur : toute modification la rend invalide et l'API renvoie 401. Le piège : croire que le JWT est chiffré.`
    },
    {
      q: `Dans quel ordre faut-il placer les middlewares ?`,
      options: ["<code>UseAuthentication()</code> puis <code>UseAuthorization()</code>", "<code>UseAuthorization()</code> puis <code>UseAuthentication()</code>", "L'ordre n'a pas d'importance"],
      answer: 0,
      why: `L'autorisation a besoin de savoir qui est l'utilisateur. Il faut donc d'abord que l'authentification ait lu le jeton et rempli <code>HttpContext.User</code>.`
    },
    {
      q: `Que peut-on mettre sans risque dans les claims d'un JWT ?`,
      options: ["Le mot de passe haché de l'utilisateur", "Le numéro de carte bancaire", "L'identifiant et le rôle de l'utilisateur"],
      answer: 2,
      why: `Le payload d'un JWT est lisible par tous. On n'y met que ce qui sert à identifier l'utilisateur et ses droits, jamais de secret.`
    }
  ],
  project: `<p><strong>OrderFlow : un login et des commandes protégées.</strong> Dans ton API OrderFlow, ajoute le package <code>Microsoft.AspNetCore.Authentication.JwtBearer</code> et une section <code>"Jwt"</code> dans <code>appsettings.json</code> (mets la clé dans les user secrets). Crée un <code>TokenService</code> et un endpoint <code>POST /api/auth/login</code>. Pour l'instant, vérifie seulement que l'email existe dans la table <code>Customers</code> et que le mot de passe vaut une valeur de démo. Mets l'<code>Id</code> du client dans le claim <code>sub</code>. Enfin, ajoute <code>.RequireAuthorization()</code> sur le groupe <code>/api/orders</code> et vérifie avec curl : 401 sans jeton, 200 avec.</p>`,
  resources: [
    { label: "Configurer l'authentification JWT Bearer (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/security/authentication/configure-jwt-bearer-authentication" },
    { label: "Authentification et autorisation dans les Minimal APIs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/security" }
  ]
});

// =====================================================================
// Autoriser : rôles et policies
// =====================================================================
window.COURSE.push({
  key: "api-authorization",
  title: "Autoriser : rôles et policies",
  summary: "Tu sauras réserver des endpoints à certains rôles, écrire des policies nommées et empêcher un client de lire les commandes d'un autre.",
  objectives: [
    "Restreindre un endpoint à un rôle avec une policy",
    "Créer des policies nommées avec AddAuthorizationBuilder",
    "Protéger toute l'API par défaut avec une fallback policy",
    "Vérifier qu'une ressource appartient bien à l'utilisateur"
  ],
  analogy: `<p>Reprends le festival. Ton bracelet prouve qui tu es : c'est l'authentification. Mais devant la porte des coulisses, un agent lit la <strong>couleur</strong> du bracelet : seuls les bracelets « staff » passent. C'est l'autorisation.</p>
<p>Et même un staff ne peut pas ouvrir n'importe quel casier : il ne peut ouvrir que <strong>le sien</strong>. Vérifier le rôle ne suffit pas toujours, il faut aussi vérifier à qui appartient la chose demandée.</p>`,
  lesson: `<h3>Après le « qui », le « quoi »</h3>
<p>Dans la leçon précédente, l'API a appris à reconnaître l'utilisateur grâce au jeton. Maintenant, elle doit décider ce qu'il a le droit de faire. Dans OrderFlow, tout le monde peut voir le catalogue, un client connecté peut passer et lire <em>ses</em> commandes, et seul un administrateur peut supprimer un produit.</p>
<p>C'est exactement le rôle des <strong>guards</strong> Angular (<code>canActivate</code>) côté front. Mais attention : un guard Angular ne fait que masquer un écran. N'importe qui peut appeler l'API directement avec curl. La vraie protection est <strong>toujours</strong> côté serveur.</p>
<div class="compare"><div><h4>Guard Angular</h4><p>Confort pour l'utilisateur : il ne voit pas la page « Admin ». Contournable en deux secondes.</p></div><div><h4>Policy ASP.NET Core</h4><p>Sécurité réelle : l'API refuse la requête avec 403, quel que soit le client utilisé.</p></div></div>

<h3>Des jetons de test sans écrire de login</h3>
<p>Pour tester l'autorisation, il te faut des jetons avec différents rôles. Le SDK fournit l'outil <code>dotnet user-jwts</code>. La commande <code>dotnet user-jwts create --name bob --role Customer</code> fabrique un jeton signé et configure automatiquement la validation dans <code>appsettings.Development.json</code>. Côté code, il suffit alors de <code>AddAuthentication().AddJwtBearer()</code>, sans paramètres.</p>
<p>On peut ajouter des claims personnalisés avec <code>--claim customer_id=7</code>. C'est uniquement un outil de développement : en production, les jetons viennent de ton login ou d'un fournisseur d'identité.</p>

<h3>Rôles et policies</h3>
<p>Un <strong>rôle</strong> est un claim particulier (<code>Admin</code>, <code>Customer</code>). Une <strong>policy</strong> (politique d'accès) est une règle nommée qui regroupe une ou plusieurs exigences : « avoir le rôle Admin », « avoir le claim customer_id », « être connecté ». On les déclare une fois, puis on les applique par leur nom.</p>
<div class="flow"><span>Requête + jeton</span><span>UseAuthentication : qui ?</span><span>UseAuthorization : policy OK ?</span><span>Handler ou 401 / 403</span></div>
<table>
<tr><th>Exigence</th><th>Sens</th></tr>
<tr><td><code>RequireAuthenticatedUser()</code></td><td>Être connecté, peu importe qui</td></tr>
<tr><td><code>RequireRole("Admin")</code></td><td>Avoir ce rôle (ou un des rôles listés)</td></tr>
<tr><td><code>RequireClaim("customer_id")</code></td><td>Posséder ce claim, avec n'importe quelle valeur</td></tr>
<tr><td><code>RequireAssertion(ctx =&gt; …)</code></td><td>Une condition libre écrite en C#</td></tr>
</table>
<p>On les déclare avec <code>builder.Services.AddAuthorizationBuilder().AddPolicy("AdminOnly", p =&gt; p.RequireRole("Admin"))</code>, puis on écrit <code>.RequireAuthorization("AdminOnly")</code> sur un endpoint. Sur un <strong>groupe</strong> de routes (<code>app.MapGroup("/api/admin")</code>), la policy s'applique à tous ses endpoints d'un coup.</p>
<div class="tip">Préfère les policies aux rôles écrits partout. Si demain les « Manager » ont aussi le droit de supprimer un produit, tu changes une seule ligne : la policy.</div>

<h3>Fermé par défaut : la fallback policy</h3>
<p>Oublier un <code>.RequireAuthorization()</code> sur un nouvel endpoint arrive vite. La <strong>fallback policy</strong> s'applique à tout endpoint qui n'a <em>aucune</em> règle. En la réglant sur « utilisateur connecté », toute l'API devient privée par défaut. Tu ouvres ensuite explicitement ce qui doit être public avec <code>.AllowAnonymous()</code>.</p>
<p>C'est le principe du « fermé par défaut » : un oubli rend un endpoint trop protégé (tu le verras vite), pas trop ouvert (tu ne le verrais peut-être jamais).</p>

<h3>Le piège n°1 : la commande du voisin</h3>
<p>Bob est connecté, il a le rôle <code>Customer</code>, la policy le laisse passer. Il appelle <code>GET /api/orders/2</code>… qui est la commande d'Alice. Aucune policy ne peut deviner que la commande 2 n'est pas à lui. Cette faille s'appelle <strong>BOLA</strong> (Broken Object Level Authorization) et c'est la plus fréquente dans les APIs réelles.</p>
<p>La parade est simple : dans le handler, on filtre toujours par l'utilisateur courant, par exemple <code>o.Id == id &amp;&amp; o.CustomerId == customerId</code>. Si la commande n'est pas à lui, on répond <code>404</code> : on ne confirme même pas qu'elle existe.</p>
<div class="note">En entretien, on te demandera la différence entre 401 et 403, et comment éviter qu'un client lise les données d'un autre. Réponse attendue : 401 = non identifié, 403 = identifié mais refusé ; et pour les données, on vérifie l'appartenance de chaque ressource dans la requête elle-même, jamais seulement avec un rôle.</div>`,
  examples: [
    {
      title: "Une policy réservée aux administrateurs",
      code: `// Fichier : Program.cs
// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
// dotnet user-jwts create --name alice --role Admin
// dotnet user-jwts create --name bob --role Customer --claim customer_id=7
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddJwtBearer();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapDelete("/api/products/{id:int}", (int id) => Results.NoContent())
   .RequireAuthorization("AdminOnly");

app.Run();

// curl -i -X DELETE http://localhost:5082/api/products/3                       (aucun jeton)
// curl -i -X DELETE http://localhost:5082/api/products/3 -H "Authorization: Bearer <jeton de bob>"
// curl -i -X DELETE http://localhost:5082/api/products/3 -H "Authorization: Bearer <jeton d'alice>"`,
      output: `HTTP/1.1 401 Unauthorized

HTTP/1.1 403 Forbidden

HTTP/1.1 204 No Content`,
      steps: [
        "<code>dotnet user-jwts create --name bob --role Customer …</code> : à lancer dans le dossier du projet. L'outil affiche le jeton et écrit la configuration de validation dans <code>appsettings.Development.json</code>.",
        "<code>AddJwtBearer()</code> : sans paramètres, il lit la configuration écrite par <code>user-jwts</code> (émetteur <code>dotnet-user-jwts</code>, audiences du projet).",
        "<code>.AddPolicy(\"AdminOnly\", policy =&gt; policy.RequireRole(\"Admin\"))</code> : on déclare une règle nommée.",
        "<code>.RequireAuthorization(\"AdminOnly\")</code> : on applique la règle par son nom à l'endpoint DELETE.",
        "Sortie, 1re ligne : sans jeton, on ne sait pas qui appelle : <code>401</code>.",
        "Sortie, 2e ligne : Bob est identifié mais n'est pas Admin : <code>403</code>.",
        "Sortie, 3e ligne : Alice est Admin, le handler s'exécute : <code>204 No Content</code>."
      ],
      explain: "Le port 5082 vient de launchSettings.json : user-jwts y prend les audiences acceptées, lance donc l'API avec dotnet run (profil http)."
    },
    {
      title: "Fermé par défaut, ouvert au besoin",
      code: `// Fichier : Program.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddJwtBearer();

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/products", () => new[] { "Clavier", "Souris" }).AllowAnonymous();
app.MapGet("/api/orders", () => new[] { 1, 2 });   // aucune règle : fallback
app.MapGet("/api/whoami", (ClaimsPrincipal user) => new
{
    Name = user.Identity?.Name,
    Roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value)
});

app.Run();

// curl http://localhost:5082/api/products
// curl -i http://localhost:5082/api/orders
// curl http://localhost:5082/api/whoami -H "Authorization: Bearer <jeton de bob>"`,
      output: `["Clavier","Souris"]

HTTP/1.1 401 Unauthorized

{"name":"bob","roles":["Customer"]}`,
      steps: [
        "<code>SetFallbackPolicy(…RequireAuthenticatedUser()…)</code> : tout endpoint sans règle exigera un utilisateur connecté.",
        "<code>.AllowAnonymous()</code> : le catalogue est volontairement public, on le dit explicitement.",
        "<code>app.MapGet(\"/api/orders\", …)</code> : aucun <code>RequireAuthorization</code> écrit, et pourtant il est protégé grâce à la fallback policy : sans jeton, <code>401</code>.",
        "<code>user.FindAll(ClaimTypes.Role)</code> : ici on n'a pas désactivé <code>MapInboundClaims</code>, donc le claim <code>role</code> du jeton a été renommé en <code>ClaimTypes.Role</code>. <code>IsInRole</code> fonctionne dans les deux cas.",
        "Sortie : <code>/api/whoami</code> montre ce que l'API a compris du jeton de Bob."
      ]
    },
    {
      title: "Chaque client ne voit que ses commandes",
      code: `// Fichier : Program.cs
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CustomerOnly", policy => policy.RequireClaim("customer_id"));

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

var orders = new List<Order> { new(1, 7, 59.90m), new(2, 8, 120.00m) };

app.MapGet("/api/my/orders/{id:int}", (int id, ClaimsPrincipal user) =>
{
    var customerId = int.Parse(user.FindFirstValue("customer_id")!);
    var order = orders.FirstOrDefault(o => o.Id == id && o.CustomerId == customerId);
    return order is null ? Results.NotFound() : Results.Ok(order);
}).RequireAuthorization("CustomerOnly");

app.Run();

record Order(int Id, int CustomerId, decimal Total);

// Bob a customer_id=7 dans son jeton, Alice n'a pas de customer_id.
// curl -i http://localhost:5082/api/my/orders/1 -H "Authorization: Bearer <jeton de bob>"
// curl -i http://localhost:5082/api/my/orders/2 -H "Authorization: Bearer <jeton de bob>"
// curl -i http://localhost:5082/api/my/orders/1 -H "Authorization: Bearer <jeton d'alice>"`,
      output: `HTTP/1.1 200 OK
{"id":1,"customerId":7,"total":59.90}

HTTP/1.1 404 Not Found

HTTP/1.1 403 Forbidden`,
      steps: [
        "<code>policy.RequireClaim(\"customer_id\")</code> : seuls les jetons qui portent un identifiant client passent.",
        "<code>int.Parse(user.FindFirstValue(\"customer_id\")!)</code> : on lit l'identifiant du client <strong>depuis le jeton</strong>, jamais depuis l'URL ou le corps (sinon Bob pourrait mentir).",
        "<code>o.Id == id &amp;&amp; o.CustomerId == customerId</code> : la commande doit avoir le bon numéro <em>et</em> appartenir au client.",
        "Sortie, 1re réponse : la commande 1 appartient au client 7, Bob la voit.",
        "Sortie, 2e réponse : la commande 2 existe mais appartient au client 8. Bob reçoit <code>404</code>, comme si elle n'existait pas.",
        "Sortie, 3e réponse : le jeton d'Alice n'a pas de claim <code>customer_id</code>, la policy la refuse avec <code>403</code>."
      ],
      explain: "La policy filtre le type d'utilisateur ; le filtre dans la requête protège chaque ressource. Il faut les deux."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une policy pour les managers",
      prompt: `<p>Déclare une policy <code>"CanManageProducts"</code> qui accepte les rôles <code>Admin</code> <strong>ou</strong> <code>Manager</code>, et applique-la à <code>POST /api/products</code>. Crée un jeton Manager avec <code>dotnet user-jwts</code> pour tester.</p>`,
      hint: `<p><code>RequireRole</code> accepte plusieurs rôles : il suffit d'en avoir un.</p>`,
      solution: `builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanManageProducts", policy => policy.RequireRole("Admin", "Manager"));

// ...
app.MapPost("/api/products", () => Results.Created("/api/products/3", null))
   .RequireAuthorization("CanManageProducts");

// dotnet user-jwts create --name carol --role Manager`
    },
    {
      level: "moyen",
      title: "Un groupe d'administration",
      prompt: `<p>Crée un groupe <code>/api/admin</code> protégé par la policy <code>AdminOnly</code>, avec deux endpoints : <code>GET /api/admin/stats</code> (renvoie <code>new { Orders = 2 }</code>) et <code>DELETE /api/admin/orders/{id:int}</code> (renvoie 204). Écris la policy une seule fois.</p>`,
      hint: `<p><code>var admin = app.MapGroup("/api/admin").RequireAuthorization("AdminOnly");</code> puis <code>admin.MapGet(…)</code>.</p>`,
      solution: `builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));

// ...
var admin = app.MapGroup("/api/admin").RequireAuthorization("AdminOnly");

admin.MapGet("/stats", () => new { Orders = 2 });
admin.MapDelete("/orders/{id:int}", (int id) => Results.NoContent());

// Jeton de bob (Customer) : 403 sur les deux. Jeton d'alice (Admin) : 200 et 204.`
    },
    {
      level: "difficile",
      title: "Le client ou l'admin",
      prompt: `<p>Améliore l'exemple 3 : un administrateur doit pouvoir lire <strong>n'importe quelle</strong> commande, un client seulement les siennes. Remplace la policy <code>CustomerOnly</code> par une policy <code>"CanReadOrders"</code> qui accepte un utilisateur ayant le rôle Admin <em>ou</em> un claim <code>customer_id</code>.</p>`,
      hint: `<p>Utilise <code>RequireAssertion(ctx =&gt; ctx.User.IsInRole("Admin") || ctx.User.HasClaim(c =&gt; c.Type == "customer_id"))</code>. Dans le handler, si l'utilisateur est Admin, ne filtre pas par client.</p>`,
      solution: `builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanReadOrders", policy => policy.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") || ctx.User.HasClaim(c => c.Type == "customer_id")));

// ...
app.MapGet("/api/orders/{id:int}", (int id, ClaimsPrincipal user) =>
{
    Order? order;
    if (user.IsInRole("Admin"))
    {
        order = orders.FirstOrDefault(o => o.Id == id);
    }
    else
    {
        var customerId = int.Parse(user.FindFirstValue("customer_id")!);
        order = orders.FirstOrDefault(o => o.Id == id && o.CustomerId == customerId);
    }
    return order is null ? Results.NotFound() : Results.Ok(order);
}).RequireAuthorization("CanReadOrders");`
    }
  ],
  quiz: [
    {
      q: `Bob est connecté avec le rôle <code>Customer</code> et appelle un endpoint protégé par <code>RequireRole("Admin")</code>. Quelle réponse reçoit-il ?`,
      options: ["<code>401 Unauthorized</code>", "<code>404 Not Found</code>", "<code>403 Forbidden</code>"],
      answer: 2,
      why: `Bob est identifié (son jeton est valide), donc ce n'est pas un 401. Il n'a simplement pas le droit : c'est un 403.`
    },
    {
      q: `Un guard Angular empêche déjà d'afficher la page d'administration. Faut-il quand même une policy côté API ?`,
      options: ["Oui, car n'importe qui peut appeler l'API sans passer par Angular", "Non, le guard suffit", "Seulement en production"],
      answer: 0,
      why: `Le guard ne protège que l'interface. Avec curl ou Postman, on appelle l'API directement. Seul le serveur peut vraiment refuser une requête.`
    },
    {
      q: `À quoi sert <code>SetFallbackPolicy</code> avec <code>RequireAuthenticatedUser()</code> ?`,
      options: ["À rendre tous les endpoints publics", "À exiger un utilisateur connecté sur tout endpoint qui n'a aucune règle", "À remplacer toutes les policies existantes"],
      answer: 1,
      why: `La fallback policy ne s'applique qu'aux endpoints sans règle. Elle rend l'API privée par défaut ; les endpoints avec leur propre policy ou avec <code>AllowAnonymous()</code> gardent leur comportement.`
    },
    {
      q: `Comment empêcher Bob de lire <code>/api/orders/2</code> qui appartient à Alice ?`,
      options: ["Ajouter <code>RequireRole(\"Customer\")</code>", "Filtrer la commande par l'identifiant client lu dans le jeton", "Cacher l'identifiant des commandes dans Angular"],
      answer: 1,
      why: `Un rôle ne dit rien sur la propriété d'une ressource : Bob et Alice sont tous les deux Customer. Il faut vérifier dans la requête que la commande appartient à l'utilisateur du jeton (protection contre BOLA).`
    }
  ],
  project: `<p><strong>OrderFlow : qui a le droit de quoi.</strong> Déclare deux policies : <code>"AdminOnly"</code> (rôle Admin) et <code>"CustomerOnly"</code> (claim <code>customer_id</code>). Mets une fallback policy « utilisateur connecté » et ouvre <code>GET /api/products</code> et <code>POST /api/auth/login</code> avec <code>.AllowAnonymous()</code>. Réserve <code>POST</code>, <code>PUT</code> et <code>DELETE</code> sur <code>/api/products</code> à <code>AdminOnly</code>. Enfin, dans <code>GET /api/orders/{id}</code>, filtre la requête EF Core par <code>CustomerId</code> lu dans le jeton et renvoie 404 si la commande n'est pas au client. Teste avec deux jetons <code>dotnet user-jwts</code>.</p>`,
  resources: [
    { label: "Autorisation basée sur des stratégies (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/security/authorization/policies" },
    { label: "Générer des jetons avec dotnet user-jwts (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/security/authentication/jwt-authn" }
  ]
});

// =====================================================================
// CORS et limitation de débit
// =====================================================================
window.COURSE.push({
  key: "api-cors-ratelimit",
  title: "CORS et limitation de débit",
  summary: "Tu sauras autoriser ton front Angular à appeler l'API et limiter le nombre de requêtes qu'un client peut envoyer.",
  objectives: [
    "Comprendre pourquoi le navigateur bloque un appel vers une autre origine",
    "Configurer une politique CORS pour http://localhost:4200",
    "Limiter le débit d'un endpoint avec AddRateLimiter",
    "Répondre 429 Too Many Requests quand la limite est atteinte"
  ],
  analogy: `<p><strong>CORS</strong>, c'est une liste d'invités à l'entrée d'une soirée. Le videur (le navigateur) demande à l'organisateur (ton API) : « Cette personne venant de <em>localhost:4200</em>, elle est sur ta liste ? ». Si la réponse est non, le videur ne la laisse pas entrer.</p>
<p>La <strong>limitation de débit</strong>, c'est le guichet d'une boulangerie qui sert trois clients par minute. Le quatrième entend « revenez dans un instant ». Personne n'est vexé, et la boulangerie ne croule pas.</p>`,
  lesson: `<h3>Le problème : deux origines</h3>
<p>Une <strong>origine</strong>, c'est le trio <em>schéma + domaine + port</em>. Ton front Angular tourne sur <code>http://localhost:4200</code> et ton API sur <code>http://localhost:5080</code> : même domaine, mais port différent, donc <strong>deux origines</strong>. Par sécurité, le navigateur interdit au JavaScript d'une origine de lire les réponses d'une autre, sauf si le serveur l'autorise.</p>
<p>Cette autorisation s'appelle <strong>CORS</strong> (Cross-Origin Resource Sharing, partage de ressources entre origines). Le serveur ajoute des en-têtes <code>Access-Control-Allow-*</code> à ses réponses, et le navigateur les lit avant de donner la réponse à ton code Angular.</p>
<div class="tip">CORS n'est <strong>pas</strong> une protection de ton API : c'est le navigateur qui applique la règle. curl, Postman ou un autre serveur l'ignorent totalement. Pour protéger l'API, il faut l'authentification et l'autorisation.</div>

<h3>La requête préliminaire (preflight)</h3>
<p>Pour une requête « non simple » (un <code>DELETE</code>, un <code>PUT</code>, un en-tête <code>Authorization</code> ou un corps JSON), le navigateur envoie d'abord une requête <code>OPTIONS</code> pour demander la permission. Si l'API répond avec les bons en-têtes, la vraie requête part. Sinon, elle n'est jamais envoyée.</p>
<div class="flow"><span>Angular : http.delete(…)</span><span>Navigateur : OPTIONS + Origin</span><span>API : Access-Control-Allow-*</span><span>Navigateur : envoie le DELETE</span></div>
<p>Quand Angular affiche une erreur CORS dans la console, ouvre l'onglet Réseau et cherche cette requête <code>OPTIONS</code> : c'est presque toujours là qu'est le problème (origine mal écrite, avec un <code>/</code> final ou <code>https</code> au lieu de <code>http</code>).</p>

<h3>Configurer CORS</h3>
<p>On déclare une politique nommée avec <code>builder.Services.AddCors(…)</code>, en listant explicitement les origines, méthodes et en-têtes autorisés. Puis on l'active avec <code>app.UseCors("Angular")</code>, placé <strong>avant</strong> <code>UseAuthentication</code> et <code>UseAuthorization</code>.</p>
<p>En pratique, on lit la liste des origines depuis la configuration, pour avoir <code>http://localhost:4200</code> en développement et <code>https://app.orderflow.fr</code> en production. <code>AllowAnyOrigin()</code> existe, mais à éviter sur une API privée.</p>
<div class="tip">Avec un JWT envoyé dans l'en-tête <code>Authorization</code>, tu n'as pas besoin de <code>AllowCredentials()</code>. Il ne sert que pour les cookies.</div>

<h3>Limiter le débit</h3>
<p>Sans limite, un client mal écrit qui boucle, un robot qui aspire ton catalogue ou un attaquant qui essaie des milliers de mots de passe peuvent saturer ton API. ASP.NET Core intègre un middleware de <strong>rate limiting</strong> (limitation de débit) : <code>AddRateLimiter</code> pour déclarer les règles, <code>UseRateLimiter</code> pour les appliquer, et <code>.RequireRateLimiting("nom")</code> sur un endpoint.</p>
<table>
<tr><th>Algorithme</th><th>Principe</th><th>Usage typique</th></tr>
<tr><td>Fixed window</td><td>N requêtes par fenêtre de temps fixe</td><td>Le plus simple, quotas classiques</td></tr>
<tr><td>Sliding window</td><td>La fenêtre glisse par petits segments</td><td>Évite les rafales à la frontière de deux fenêtres</td></tr>
<tr><td>Token bucket</td><td>Un seau de jetons qui se remplit régulièrement</td><td>Autoriser de courtes rafales</td></tr>
<tr><td>Concurrency</td><td>N requêtes <em>en même temps</em> au maximum</td><td>Protéger un endpoint lent (export)</td></tr>
</table>
<pre class="diagram">
 Fenêtre fixe : 3 requêtes / 10 s
 |---- 0 s à 10 s ----|---- 10 s à 20 s ---|
   R1  R2  R3  R4  R5    R6  R7
   ok  ok  ok  429 429   ok  ok
</pre>
<p>Par défaut, une requête refusée reçoit un <code>503</code>. Règle <code>RejectionStatusCode</code> sur <code>429 Too Many Requests</code>, le code prévu pour ça. Côté Angular, un intercepteur peut alors afficher « Trop de tentatives, réessaie dans un instant ».</p>

<h3>Une limite par client</h3>
<p>Une limite globale ferait payer tout le monde pour un seul abuseur. On <strong>partitionne</strong> donc : chaque adresse IP (ou chaque utilisateur connecté) a son propre compteur, grâce à <code>RateLimitPartition.GetFixedWindowLimiter(clé, …)</code>. C'est idéal pour le login : 5 essais par minute et par IP rendent une attaque par force brute très lente.</p>
<div class="note">Derrière un reverse proxy, l'API voit l'IP du proxy, pas celle du client : configure les <em>forwarded headers</em> sinon tout le monde partage le même compteur. Et avec plusieurs instances de l'API, chaque instance a ses propres compteurs en mémoire : pour une limite vraiment globale, on la place dans la passerelle d'API ou on utilise un stockage partagé.</div>`,
  examples: [
    {
      title: "Autoriser le front Angular",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy => policy
        .WithOrigins("http://localhost:4200")
        .WithMethods("GET", "POST", "PUT", "DELETE")
        .WithHeaders("Content-Type", "Authorization"));
});

var app = builder.Build();
app.UseCors("Angular");

app.MapGet("/api/products", () => new[] { "Clavier", "Souris" });

app.Run();

// Ce que fait le navigateur avant un DELETE avec jeton :
// curl -i -X OPTIONS http://localhost:5080/api/products
//   -H "Origin: http://localhost:4200"
//   -H "Access-Control-Request-Method: DELETE"
//   -H "Access-Control-Request-Headers: authorization"
// Puis la même chose avec -H "Origin: http://evil.example"`,
      output: `HTTP/1.1 204 No Content
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Allow-Origin: http://localhost:4200

HTTP/1.1 204 No Content`,
      steps: [
        "<code>options.AddPolicy(\"Angular\", …)</code> : on crée une politique CORS nommée.",
        "<code>.WithOrigins(\"http://localhost:4200\")</code> : seule l'origine du serveur de dev Angular est acceptée. Pas de <code>/</code> à la fin.",
        "<code>.WithMethods(…)</code> et <code>.WithHeaders(…)</code> : les méthodes et en-têtes que le front a le droit d'utiliser.",
        "<code>app.UseCors(\"Angular\");</code> : active la politique. Elle se place tôt dans le pipeline, avant l'authentification.",
        "Sortie, 1re réponse : la préflight venant de <code>localhost:4200</code> reçoit les en-têtes <code>Access-Control-Allow-*</code>. Le navigateur enverra le DELETE.",
        "Sortie, 2e réponse : pour <code>evil.example</code>, l'API répond aussi 204 mais <strong>sans</strong> en-tête <code>Access-Control-Allow-Origin</code>. C'est le navigateur qui bloquera."
      ],
      explain: "Un GET normal avec Origin: http://localhost:4200 reçoit 200, le JSON et l'en-tête Access-Control-Allow-Origin: http://localhost:4200."
    },
    {
      title: "Trois requêtes par fenêtre de 10 secondes",
      code: `// Fichier : Program.cs
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("fixed", limiter =>
    {
        limiter.PermitLimit = 3;                    // 3 requêtes…
        limiter.Window = TimeSpan.FromSeconds(10);  // …par fenêtre de 10 s
        limiter.QueueLimit = 0;                     // pas de file d'attente
    });

    options.AddPolicy("per-ip", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));
});

var app = builder.Build();
app.UseRateLimiter();

app.MapGet("/api/products", () => new[] { "Clavier", "Souris" })
   .RequireRateLimiting("fixed");
app.MapPost("/api/auth/login", () => Results.Ok("ok"))
   .RequireRateLimiting("per-ip");

app.Run();

// for i in 1 2 3 4 5; do curl -s -o /dev/null -w "Requête $i : %{http_code}\\n" http://localhost:5080/api/products; done`,
      output: `Requête 1 : 200
Requête 2 : 200
Requête 3 : 200
Requête 4 : 429
Requête 5 : 429`,
      steps: [
        "<code>options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;</code> : sans cette ligne, une requête refusée recevrait un 503.",
        "<code>options.AddFixedWindowLimiter(\"fixed\", …)</code> : une règle nommée, 3 requêtes toutes les 10 secondes pour tout le monde.",
        "<code>limiter.QueueLimit = 0;</code> : au-delà de la limite, on refuse tout de suite au lieu de faire patienter la requête.",
        "<code>options.AddPolicy(\"per-ip\", …)</code> : une règle partitionnée. Chaque IP a son propre compteur de 5 requêtes par minute.",
        "<code>app.UseRateLimiter();</code> puis <code>.RequireRateLimiting(\"fixed\")</code> : on active le middleware et on choisit la règle de chaque endpoint.",
        "Sortie : les 3 premières requêtes passent, les suivantes reçoivent <code>429</code> jusqu'à la fenêtre suivante. Sur le login, 7 appels rapides donnent <code>200 200 200 200 200 429 429</code>."
      ],
      explain: "La boucle for est une commande bash (Git Bash sous Windows)."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les origines depuis la configuration",
      prompt: `<p>Au lieu d'écrire <code>"http://localhost:4200"</code> en dur, lis la liste des origines depuis <code>appsettings.json</code> : <code>"Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }</code>.</p>`,
      hint: `<p><code>builder.Configuration.GetSection("Cors:AllowedOrigins").Get&lt;string[]&gt;()</code> renvoie un tableau, ou <code>null</code> si la section manque.</p>`,
      solution: `var origins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy => policy
        .WithOrigins(origins)
        .WithMethods("GET", "POST", "PUT", "DELETE")
        .WithHeaders("Content-Type", "Authorization"));
});`
    },
    {
      level: "moyen",
      title: "Une limite sur tout un groupe",
      prompt: `<p>Crée une règle <code>"api"</code> à 100 requêtes par minute (fenêtre fixe) et applique-la à tout le groupe <code>/api</code> en une seule ligne. Garde la règle <code>"per-ip"</code> plus stricte pour le login.</p>`,
      hint: `<p><code>app.MapGroup("/api").RequireRateLimiting("api")</code> applique la règle à tous les endpoints du groupe.</p>`,
      solution: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.PermitLimit = 100;
        limiter.Window = TimeSpan.FromMinutes(1);
    });
});

var app = builder.Build();
app.UseRateLimiter();

var api = app.MapGroup("/api").RequireRateLimiting("api");
api.MapGet("/products", () => new[] { "Clavier", "Souris" });
api.MapGet("/orders", () => new[] { 1, 2 });`
    },
    {
      level: "difficile",
      title: "Dire au client quand revenir",
      prompt: `<p>Quand une requête est refusée, ajoute l'en-tête <code>Retry-After</code> (en secondes) à la réponse 429, pour que le front sache combien de temps attendre. Utilise <code>options.OnRejected</code>.</p>`,
      hint: `<p><code>OnRejected</code> reçoit un contexte avec <code>context.Lease</code> et <code>context.HttpContext</code>. <code>context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)</code> donne un <code>TimeSpan</code>.</p>`,
      solution: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)retryAfter.TotalSeconds).ToString();
        }
        return ValueTask.CompletedTask;
    };
    options.AddFixedWindowLimiter("fixed", limiter =>
    {
        limiter.PermitLimit = 3;
        limiter.Window = TimeSpan.FromSeconds(10);
    });
});
// Réponse refusée : HTTP/1.1 429 Too Many Requests  +  Retry-After: <secondes restantes>`
    }
  ],
  quiz: [
    {
      q: `Ton front tourne sur <code>http://localhost:4200</code> et ton API sur <code>http://localhost:5080</code>. Est-ce la même origine ?`,
      options: ["Oui, c'est le même domaine localhost", "Non, le port est différent", "Oui, car les deux sont en http"],
      answer: 1,
      why: `Une origine est le trio schéma + domaine + port. Il suffit qu'un des trois change pour que ce soit une autre origine.`
    },
    {
      q: `Un attaquant appelle ton API avec curl depuis son PC. Ta politique CORS n'autorise que <code>localhost:4200</code>. Que se passe-t-il ?`,
      options: ["La requête est bloquée par CORS", "L'API renvoie 403", "La requête passe : CORS ne concerne que les navigateurs"],
      answer: 2,
      why: `CORS est appliqué par le navigateur, pas par le serveur. curl ignore ces en-têtes. Pour protéger l'API, il faut l'authentification et l'autorisation.`
    },
    {
      q: `Quel code HTTP faut-il renvoyer quand un client dépasse la limite de débit ?`,
      options: ["<code>429 Too Many Requests</code>", "<code>503 Service Unavailable</code>", "<code>400 Bad Request</code>"],
      answer: 0,
      why: `429 est fait pour ça. Le middleware renvoie 503 par défaut, d'où l'intérêt de régler <code>RejectionStatusCode</code>.`
    },
    {
      q: `Pourquoi partitionner la limite du login par adresse IP ?`,
      options: ["Pour que la limite soit plus rapide à calculer", "Pour qu'un seul abuseur ne bloque pas tous les autres utilisateurs", "Parce que c'est obligatoire avec CORS"],
      answer: 1,
      why: `Avec un compteur global, un robot qui consomme toutes les requêtes empêcherait tout le monde de se connecter. Avec un compteur par IP, seul l'abuseur est freiné.`
    }
  ],
  project: `<p><strong>OrderFlow : prêt pour le front Angular.</strong> Ajoute une section <code>"Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }</code> dans <code>appsettings.Development.json</code> et une politique CORS <code>"Angular"</code> qui la lit. Place <code>app.UseCors("Angular")</code> avant <code>UseAuthentication()</code>. Ajoute ensuite le rate limiting : une règle <code>"per-ip"</code> de 5 requêtes par minute sur <code>POST /api/auth/login</code>, avec un statut 429. Vérifie avec une boucle curl que le 6e essai est refusé.</p>`,
  resources: [
    { label: "Activer CORS dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/security/cors" },
    { label: "Middleware de limitation de débit (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/performance/rate-limit" }
  ]
});

// =====================================================================
// Appeler d'autres APIs avec IHttpClientFactory
// =====================================================================
window.COURSE.push({
  key: "api-httpclient",
  title: "Appeler d'autres APIs avec IHttpClientFactory",
  summary: "Tu sauras appeler une API externe depuis ton API avec un client typé, gérer ses erreurs et rendre l'appel résistant aux pannes passagères.",
  objectives: [
    "Comprendre pourquoi on n'écrit pas new HttpClient() à chaque appel",
    "Créer un client nommé puis un client typé avec AddHttpClient",
    "Lire du JSON et gérer une réponse en erreur",
    "Ajouter des nouvelles tentatives automatiques avec AddStandardResilienceHandler"
  ],
  analogy: `<p>Pour appeler un fournisseur, tu pourrais acheter un nouveau téléphone à chaque appel et le jeter après. Absurde et coûteux. Une entreprise a plutôt un <strong>standard téléphonique</strong> qui gère les lignes, et chaque employé emprunte une ligne quand il en a besoin.</p>
<p><code>IHttpClientFactory</code>, c'est ce standard. Et un <strong>client typé</strong>, c'est un collègue spécialisé, « le responsable fournisseur », à qui tu demandes simplement « quel est le stock du clavier ? » sans te soucier du numéro à composer.</p>`,
  lesson: `<h3>Ton API devient cliente</h3>
<p>Une API ne vit pas seule. OrderFlow devra peut-être demander le stock à l'entrepôt d'un fournisseur, un taux de change ou l'état d'un paiement. Pour cela, ton API devient à son tour <strong>cliente</strong> d'une autre API, avec la classe <code>HttpClient</code>.</p>
<p>Tu connais le principe avec le <code>HttpClient</code> d'Angular : <code>this.http.get&lt;Product[]&gt;(url)</code>. En C#, c'est très proche : <code>await http.GetFromJsonAsync&lt;Product[]&gt;(url)</code>. La différence : en Angular tu reçois un <code>Observable</code>, en C# une <code>Task</code> que tu attends avec <code>await</code>.</p>

<h3>Le piège du new HttpClient()</h3>
<p>Écrire <code>using var client = new HttpClient();</code> à chaque appel semble logique, mais c'est un bug classique. Chaque instance ouvre ses propres connexions réseau, et elles ne sont pas libérées tout de suite. Sous charge, le serveur finit par manquer de ports : on parle d'<strong>épuisement des sockets</strong>. À l'inverse, un seul <code>HttpClient</code> statique pour toute la vie de l'application ne voit jamais les changements d'adresse DNS.</p>
<p><code>IHttpClientFactory</code> résout les deux problèmes : il recycle les connexions sous-jacentes et te donne des <code>HttpClient</code> légers. Tu l'actives avec <code>builder.Services.AddHttpClient(…)</code>.</p>
<div class="compare"><div><h4>new HttpClient() à chaque appel</h4><p>Connexions gaspillées, risque d'épuisement des sockets sous charge.</p></div><div><h4>IHttpClientFactory</h4><p>Connexions recyclées, configuration centralisée, résilience facile à ajouter.</p></div></div>

<h3>Client nommé ou client typé</h3>
<table>
<tr><th>Style</th><th>Déclaration</th><th>Utilisation</th></tr>
<tr><td>Nommé</td><td><code>AddHttpClient("supplier", c =&gt; …)</code></td><td>On injecte <code>IHttpClientFactory</code> et on appelle <code>CreateClient("supplier")</code></td></tr>
<tr><td>Typé (recommandé)</td><td><code>AddHttpClient&lt;SupplierClient&gt;(c =&gt; …)</code></td><td>On injecte directement <code>SupplierClient</code></td></tr>
</table>
<p>Un <strong>client typé</strong> est une classe à toi qui reçoit un <code>HttpClient</code> déjà configuré (adresse de base, délai) dans son constructeur. Elle expose des méthodes métier comme <code>GetStockAsync(sku)</code>. Le reste de l'application ne voit jamais d'URL ni de code HTTP : c'est exactement comme un service Angular qui encapsule ses appels <code>HttpClient</code>.</p>
<div class="flow"><span>Endpoint OrderFlow</span><span>SupplierClient.GetStockAsync</span><span>HttpClient (via la factory)</span><span>API du fournisseur</span></div>

<h3>Lire la réponse et gérer les erreurs</h3>
<p>Les méthodes d'extension de <code>System.Net.Http.Json</code> font la conversion JSON : <code>GetFromJsonAsync&lt;T&gt;</code>, <code>PostAsJsonAsync</code>, <code>ReadFromJsonAsync&lt;T&gt;</code>. Attention : <code>GetFromJsonAsync</code> lève une <code>HttpRequestException</code> si le statut est une erreur (404, 500…).</p>
<p>Quand une erreur est un cas normal (un produit inconnu chez le fournisseur), utilise plutôt <code>GetAsync</code>, teste <code>response.IsSuccessStatusCode</code>, puis lis le corps avec <code>ReadFromJsonAsync</code>. Pense aussi au délai : par défaut, <code>HttpClient</code> attend <strong>100 secondes</strong>. Beaucoup trop quand un utilisateur attend derrière.</p>
<div class="tip">Ne fais jamais une confiance aveugle à une API externe : elle peut être lente, en panne, ou renvoyer un JSON inattendu. Fixe un délai court et prévois toujours le cas d'erreur.</div>

<h3>La résilience en une ligne</h3>
<p>Beaucoup de pannes sont <strong>passagères</strong> : un 503 pendant un redémarrage, une coupure réseau d'une seconde. Réessayer un peu plus tard suffit souvent. Le package <code>Microsoft.Extensions.Http.Resilience</code> ajoute <code>.AddStandardResilienceHandler()</code> : un ensemble de protections préréglées.</p>
<ul>
<li><strong>Nouvelles tentatives</strong> (retry) avec un délai qui augmente, seulement sur les erreurs passagères (5xx, 408, 429, erreurs réseau).</li>
<li><strong>Délai par tentative</strong> et <strong>délai total</strong>.</li>
<li><strong>Disjoncteur</strong> (circuit breaker) : si le fournisseur échoue trop souvent, on arrête de l'appeler un moment pour le laisser respirer.</li>
</ul>
<div class="note">Attention aux nouvelles tentatives sur un <code>POST</code> qui crée quelque chose : rejouer un paiement peut débiter deux fois. Pour ces appels, désactive les retries ou utilise une clé d'idempotence acceptée par le fournisseur. Et prévois un comportement dégradé : si le stock du fournisseur est indisponible, OrderFlow peut afficher « stock inconnu » plutôt que planter.</div>`,
  examples: [
    {
      title: "Un client nommé",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("supplier", client =>
{
    client.BaseAddress = new Uri("http://localhost:5080/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

// Faux fournisseur externe, dans la même app pour la démo
app.MapGet("/supplier/stock/{sku}", (string sku) =>
    sku == "KB-01" ? Results.Ok(new { Sku = sku, Quantity = 12 }) : Results.NotFound());

app.MapGet("/api/named", async (IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("supplier");
    var json = await client.GetStringAsync("supplier/stock/KB-01");
    return Results.Text(json);
});

app.Run();

// curl -i http://localhost:5080/api/named`,
      output: `HTTP/1.1 200 OK

{"sku":"KB-01","quantity":12}`,
      steps: [
        "<code>builder.Services.AddHttpClient(\"supplier\", client =&gt; …)</code> : on enregistre un client nommé avec son adresse de base et un délai de 10 secondes.",
        "<code>app.MapGet(\"/supplier/stock/{sku}\", …)</code> : pour la démo, le « fournisseur » est un endpoint de la même application. En vrai, ce serait une autre API sur Internet.",
        "<code>(IHttpClientFactory factory)</code> : on injecte la factory dans le handler.",
        "<code>factory.CreateClient(\"supplier\")</code> : on obtient un client léger, déjà configuré.",
        "<code>client.GetStringAsync(\"supplier/stock/KB-01\")</code> : l'URL est relative à <code>BaseAddress</code>. On récupère le JSON brut en texte."
      ]
    },
    {
      title: "Un client typé qui gère le 404",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<SupplierClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5080/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

app.MapGet("/supplier/stock/{sku}", (string sku) =>
    sku == "KB-01" ? Results.Ok(new SupplierStock(sku, 12)) : Results.NotFound());

app.MapGet("/api/products/{sku}/stock", async (string sku, SupplierClient supplier) =>
    await supplier.GetStockAsync(sku) is { } stock ? Results.Ok(stock) : Results.NotFound());

app.Run();

public record SupplierStock(string Sku, int Quantity);

public class SupplierClient(HttpClient http)
{
    public async Task<SupplierStock?> GetStockAsync(string sku)
    {
        var response = await http.GetAsync($"supplier/stock/{sku}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<SupplierStock>();
    }
}

// curl -i http://localhost:5080/api/products/KB-01/stock
// curl -i http://localhost:5080/api/products/XX/stock`,
      output: `HTTP/1.1 200 OK
{"sku":"KB-01","quantity":12}

HTTP/1.1 404 Not Found`,
      steps: [
        "<code>AddHttpClient&lt;SupplierClient&gt;(…)</code> : enregistre la classe <code>SupplierClient</code> dans la DI et lui fournit un <code>HttpClient</code> configuré.",
        "<code>public class SupplierClient(HttpClient http)</code> : le client typé reçoit le <code>HttpClient</code> par son constructeur principal.",
        "<code>await http.GetAsync(…)</code> : on récupère la réponse complète, sans lever d'exception sur un 404.",
        "<code>if (!response.IsSuccessStatusCode) return null;</code> : produit inconnu chez le fournisseur, on renvoie <code>null</code> au lieu de planter.",
        "<code>ReadFromJsonAsync&lt;SupplierStock&gt;()</code> : convertit le JSON en record C#.",
        "<code>(string sku, SupplierClient supplier)</code> : l'endpoint injecte directement le client typé. Il ne voit ni URL ni code HTTP."
      ],
      explain: "Le reste de l'application dépend de SupplierClient, une classe métier : si le fournisseur change d'URL, un seul endroit bouge."
    },
    {
      title: "Réessayer sur une panne passagère",
      code: `// Fichier : Program.cs
// dotnet add package Microsoft.Extensions.Http.Resilience
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<FlakyClient>(client =>
    client.BaseAddress = new Uri("http://localhost:5080/"))
    .AddStandardResilienceHandler();

var app = builder.Build();

// Faux fournisseur qui échoue deux fois avant de répondre
var calls = 0;
app.MapGet("/supplier/flaky", () =>
    ++calls < 3 ? Results.StatusCode(503) : Results.Ok(new { Attempts = calls }));

app.MapGet("/api/flaky", (FlakyClient client) => client.GetAsync());

app.Run();

public class FlakyClient(HttpClient http)
{
    public Task<string> GetAsync() => http.GetStringAsync("supplier/flaky");
}

// curl -i http://localhost:5080/api/flaky`,
      output: `HTTP/1.1 200 OK

{"attempts":3}`,
      steps: [
        "<code>.AddStandardResilienceHandler()</code> : ajoute les retries, les délais et le disjoncteur au client typé.",
        "<code>++calls &lt; 3 ? Results.StatusCode(503) : …</code> : le faux fournisseur répond 503 aux deux premiers appels, puis 200.",
        "<code>http.GetStringAsync(\"supplier/flaky\")</code> : sans résilience, cet appel lèverait une <code>HttpRequestException</code> dès le premier 503.",
        "Sortie : le client a réessayé tout seul. La 3e tentative réussit et l'appelant ne voit que le succès.",
        "Dans la console de l'API, Polly (la bibliothèque utilisée en coulisses) affiche des avertissements <code>OnRetry</code> avec <code>Result: '503'</code> pour chaque nouvelle tentative."
      ],
      explain: "Une ligne de configuration transforme deux erreurs visibles en un succès légèrement plus lent."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Configurer l'adresse depuis appsettings",
      prompt: `<p>Dans l'exemple 2, lis l'adresse de base du fournisseur depuis <code>appsettings.json</code> : <code>"Supplier": { "BaseUrl": "http://localhost:5080/" }</code>.</p>`,
      hint: `<p><code>builder.Configuration["Supplier:BaseUrl"]</code> renvoie la chaîne (ou <code>null</code>).</p>`,
      solution: `builder.Services.AddHttpClient<SupplierClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Supplier:BaseUrl"]!);
    client.Timeout = TimeSpan.FromSeconds(10);
});`
    },
    {
      level: "moyen",
      title: "Envoyer une commande au fournisseur",
      prompt: `<p>Ajoute à <code>SupplierClient</code> une méthode <code>Task&lt;bool&gt; ReserveAsync(string sku, int quantity)</code> qui envoie <code>POST supplier/reservations</code> avec le corps JSON <code>{ "sku": …, "quantity": … }</code> et renvoie <code>true</code> si le statut est un succès. Ajoute le faux endpoint fournisseur qui répond 201 si la quantité est inférieure ou égale à 12, sinon 409.</p>`,
      hint: `<p><code>http.PostAsJsonAsync(url, objet)</code> sérialise l'objet en JSON. Côté faux fournisseur, utilise un record <code>Reservation(string Sku, int Quantity)</code>.</p>`,
      solution: `// Dans SupplierClient
public async Task<bool> ReserveAsync(string sku, int quantity)
{
    var response = await http.PostAsJsonAsync("supplier/reservations",
        new Reservation(sku, quantity));
    return response.IsSuccessStatusCode;
}

// Faux fournisseur, dans Program.cs
app.MapPost("/supplier/reservations", (Reservation r) =>
    r.Quantity <= 12 ? Results.Created($"/supplier/reservations/{r.Sku}", r)
                     : Results.Conflict());

// À la fin du fichier
public record Reservation(string Sku, int Quantity);`
    },
    {
      level: "difficile",
      title: "Un comportement dégradé",
      prompt: `<p>Le fournisseur peut être complètement en panne. Modifie <code>GetStockAsync</code> pour qu'en cas d'<code>HttpRequestException</code> (erreur réseau) ou de <code>TaskCanceledException</code> (délai dépassé), elle renvoie <code>null</code> au lieu de faire planter l'endpoint. Dans l'endpoint, renvoie alors <code>503</code> avec un message clair.</p>`,
      hint: `<p>Entoure l'appel d'un <code>try</code> / <code>catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)</code>. Dans l'endpoint, <code>Results.Problem("Fournisseur indisponible", statusCode: 503)</code>.</p>`,
      solution: `public class SupplierClient(HttpClient http)
{
    public async Task<SupplierStock?> GetStockAsync(string sku)
    {
        try
        {
            var response = await http.GetAsync($"supplier/stock/{sku}");
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<SupplierStock>();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            return null; // fournisseur injoignable ou trop lent
        }
    }
}

// Note : ici 404 et panne donnent tous deux null.
// Pour les distinguer, renvoie plutôt un petit record résultat (Found, NotFound, Unavailable).
app.MapGet("/api/products/{sku}/stock", async (string sku, SupplierClient supplier) =>
    await supplier.GetStockAsync(sku) is { } stock
        ? Results.Ok(stock)
        : Results.Problem("Fournisseur indisponible ou produit inconnu", statusCode: 503));`
    }
  ],
  quiz: [
    {
      q: `Pourquoi éviter <code>using var client = new HttpClient();</code> à chaque appel ?`,
      options: ["Parce que HttpClient ne sait pas lire le JSON", "Parce que cela peut épuiser les connexions réseau du serveur sous charge", "Parce que HttpClient est obsolète en .NET 10"],
      answer: 1,
      why: `Chaque instance ouvre ses propres connexions qui ne sont pas libérées immédiatement. Sous charge, les ports s'épuisent. <code>IHttpClientFactory</code> recycle les connexions.`
    },
    {
      q: `Que fait <code>GetFromJsonAsync&lt;T&gt;</code> si l'API répond <code>404</code> ?`,
      options: ["Elle lève une <code>HttpRequestException</code>", "Elle renvoie <code>null</code>", "Elle renvoie un objet vide"],
      answer: 0,
      why: `<code>GetFromJsonAsync</code> vérifie le statut et lève une exception en cas d'erreur. Si un 404 est un cas normal, utilise <code>GetAsync</code> puis teste <code>IsSuccessStatusCode</code>.`
    },
    {
      q: `Quel est l'avantage principal d'un client typé comme <code>SupplierClient</code> ?`,
      options: ["Il est plus rapide qu'un client nommé", "Il évite d'avoir à installer un package", "Le reste du code appelle des méthodes métier sans connaître les URL ni le HTTP"],
      answer: 2,
      why: `Comme un service Angular, le client typé encapsule les détails HTTP. Les endpoints appellent <code>GetStockAsync(sku)</code> et ne changent pas si l'API externe évolue.`
    },
    {
      q: `Sur quelles erreurs <code>AddStandardResilienceHandler()</code> réessaie-t-il ?`,
      options: ["Sur toutes les réponses, y compris 400 et 404", "Sur les erreurs passagères : 5xx, 408, 429 et erreurs réseau", "Uniquement sur les délais dépassés"],
      answer: 1,
      why: `Réessayer un 400 ou un 404 ne servirait à rien : la requête est fausse, elle le restera. Les retries visent les pannes temporaires.`
    }
  ],
  project: `<p><strong>OrderFlow : vérifier le stock chez le fournisseur.</strong> Ajoute un client typé <code>SupplierClient</code> avec une méthode <code>GetStockAsync(string sku)</code>, une adresse de base lue dans <code>appsettings.json</code>, un délai de 5 secondes et <code>.AddStandardResilienceHandler()</code>. Crée l'endpoint <code>GET /api/products/{id}/supplier-stock</code> qui charge le produit depuis la base puis interroge le fournisseur. Si le fournisseur est injoignable, renvoie un 503 avec un ProblemDetails clair. Pour tester sans vrai fournisseur, ajoute temporairement un faux endpoint <code>/supplier/stock/{sku}</code> dans l'API.</p>`,
  resources: [
    { label: "IHttpClientFactory avec .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/httpclient-factory" },
    { label: "Créer des applications HTTP résilientes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/resilience/http-resilience" }
  ]
});

// =====================================================================
// Partie 5 · Architecture, patterns et tests
// Chapitre « Tester son code »
// Pourquoi tester : la pyramide des tests
// =====================================================================
window.COURSE.push({
  key: "tst-why",
  title: "Pourquoi tester : la pyramide des tests",
  summary: "Tu sauras expliquer à quoi sert un test automatisé, distinguer test unitaire, d'intégration et de bout en bout, et écrire du code facile à tester.",
  objectives: [
    "Comprendre ce qu'un test automatisé apporte au quotidien",
    "Reconnaître les trois étages de la pyramide des tests",
    "Structurer un test en Arrange, Act, Assert",
    "Repérer du code difficile à tester et le rendre testable"
  ],
  analogy: `<p>Un restaurant vérifie sa cuisine à trois niveaux. Le chef <strong>goûte chaque sauce</strong> en la préparant : c'est rapide, il le fait cent fois par jour. Avant le service, il goûte <strong>une assiette complète</strong> pour voir si tout va bien ensemble. Et de temps en temps, un client mystère <strong>commande un vrai repas</strong> en salle.</p>
<p>Goûter chaque sauce, ce sont les tests unitaires. L'assiette complète, les tests d'intégration. Le client mystère, les tests de bout en bout. On fait beaucoup du premier, un peu du deuxième et très peu du troisième.</p>`,
  lesson: `<h3>Le problème : tout revérifier à la main</h3>
<p>Jusqu'ici, pour vérifier ton code, tu lances l'application et tu essaies : un <code>curl</code>, un clic dans Swagger, un affichage dans la console. Ça marche pour une fonction. Mais quand OrderFlow aura cinquante règles (remises, stock, statuts de commande…), personne ne revérifiera tout à la main après chaque modification.</p>
<p>Un <strong>test automatisé</strong> est un petit bout de code qui appelle ton code et vérifie le résultat. On les lance tous d'un coup, en quelques secondes. Si une modification casse une règle ailleurs (on parle de <strong>régression</strong>), un test passe au rouge et te prévient avant tes utilisateurs.</p>

<h3>Ce que les tests t'apportent</h3>
<ul>
<li><strong>Du courage pour modifier</strong> : tu peux réorganiser ton code (refactoriser) sans peur, les tests te disent si le comportement a changé.</li>
<li><strong>Une documentation vivante</strong> : un test nommé <code>Cancel_ShippedOrder_Throws</code> explique une règle métier mieux qu'un commentaire, et il ne ment jamais.</li>
<li><strong>Des bugs trouvés tôt</strong> : un bug coûte quelques minutes à corriger quand un test le trouve, des heures quand un client le signale.</li>
</ul>
<p>Tu as peut-être déjà croisé les fichiers <code>*.spec.ts</code> dans Angular, lancés par Jasmine/Karma ou Jest. C'est la même idée. En .NET, l'outil le plus répandu s'appelle <strong>xUnit</strong> : tu le découvres à la leçon suivante.</p>

<h3>La pyramide des tests</h3>
<pre class="diagram">
             /\
            /  \      Bout en bout (E2E)
           / E2E\     peu, lents, fragiles
          /------\
         /        \   Intégration
        /  Intég.  \  API + base, quelques-uns
       /------------\
      /              \  Unitaires
     /   Unitaires    \ très nombreux, rapides
    /------------------\
</pre>
<table>
<tr><th>Étage</th><th>Ce qu'on teste</th><th>Vitesse</th><th>Exemple OrderFlow</th></tr>
<tr><td>Unitaire</td><td>Une classe ou une méthode, seule</td><td>Millisecondes</td><td><code>Order.Total</code> additionne bien les lignes</td></tr>
<tr><td>Intégration</td><td>Plusieurs pièces ensemble (API, DI, base)</td><td>Secondes</td><td><code>GET /api/products/999</code> renvoie 404</td></tr>
<tr><td>Bout en bout</td><td>L'application entière, comme un utilisateur</td><td>Dizaines de secondes</td><td>Dans le navigateur, se connecter et passer une commande</td></tr>
</table>
<p>Plus on monte, plus un test est réaliste… mais lent, fragile et difficile à diagnostiquer. D'où la forme : une large base de tests unitaires, quelques tests d'intégration pour vérifier l'assemblage, et une poignée de tests de bout en bout (avec Playwright, par exemple) pour les parcours critiques.</p>

<h3>Arrange, Act, Assert</h3>
<p>Presque tous les tests suivent la même recette en trois temps, qu'on appelle <strong>AAA</strong>.</p>
<div class="flow"><span>Arrange : préparer les données</span><span>Act : appeler le code testé</span><span>Assert : vérifier le résultat</span></div>
<p>Un bon test est <strong>court</strong>, vérifie <strong>une seule chose</strong>, et donne toujours le même résultat, quel que soit le jour, l'heure ou l'ordre d'exécution. On dit qu'il est <em>déterministe</em>.</p>
<div class="tip">Teste les <strong>cas limites</strong> : la valeur pile au seuil (100 € quand la remise commence à 100 €), zéro, une liste vide, une valeur négative. C'est là que se cachent la plupart des bugs, comme un <code>&gt;</code> écrit à la place de <code>&gt;=</code>.</div>

<h3>Du code facile à tester</h3>
<p>Certains codes sont pénibles à tester. Une méthode qui lit <code>DateTime.Now</code> donne un résultat différent selon l'heure du test. Une méthode qui envoie un vrai email ou écrit dans la vraie base ne peut pas tourner mille fois par jour. La solution est toujours la même : <strong>passer la dépendance de l'extérieur</strong>, en paramètre ou par injection de dépendances.</p>
<div class="compare"><div><h4>Difficile à tester</h4><p>La méthode va chercher elle-même l'heure, la base ou le serveur mail.</p></div><div><h4>Facile à tester</h4><p>La méthode reçoit l'heure en paramètre, ou une interface <code>IEmailSender</code> qu'on peut remplacer par une fausse.</p></div></div>
<div class="note">Viser 100 % de couverture de code n'a pas de sens : un test qui exécute du code sans rien vérifier fait monter le chiffre sans rien protéger. Concentre tes tests sur les règles métier et les cas limites. Et quand tu corriges un bug, écris d'abord le test qui le reproduit : il ne reviendra jamais sans que tu le saches.</div>`,
  examples: [
    {
      title: "Des tests écrits à la main",
      code: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture; // 90.0 et pas 90,0

// Trois « tests » écrits à la main, sans framework
Check("50 € : pas de remise", ApplyDiscount(50m), 50m);
Check("150 € : remise de 10 %", ApplyDiscount(150m), 135m);
Check("100 € pile : remise de 10 %", ApplyDiscount(100m), 90m);

// La règle : 10 % de remise à partir de 100 €… mais il y a un bug
decimal ApplyDiscount(decimal total) => total > 100m ? total * 0.9m : total;

void Check(string name, decimal actual, decimal expected)
{
    var status = actual == expected ? "OK   " : "ÉCHEC";
    Console.WriteLine($"{status} {name} (attendu {expected}, obtenu {actual})");
}`,
      output: `OK    50 € : pas de remise (attendu 50, obtenu 50)
OK    150 € : remise de 10 % (attendu 135, obtenu 135.0)
ÉCHEC 100 € pile : remise de 10 % (attendu 90, obtenu 100)`,
      steps: [
        "<code>Check(\"50 € : pas de remise\", ApplyDiscount(50m), 50m);</code> : chaque appel est un mini-test. Arrange et Act tiennent sur une ligne, l'Assert est dans <code>Check</code>.",
        "<code>total &gt; 100m ? total * 0.9m : total</code> : le bug est là. La règle dit « à partir de 100 € », il fallait <code>&gt;=</code>.",
        "<code>actual == expected</code> : on compare le résultat obtenu avec le résultat attendu. C'est le cœur de tout test.",
        "Sortie, 2e ligne : <code>135.0</code> s'affiche avec un zéro car <code>150 * 0.9</code> garde une décimale en <code>decimal</code>. Pour C#, <code>135.0m == 135m</code> est vrai.",
        "Sortie, 3e ligne : seul le cas limite (100 € pile) révèle le bug. Sans lui, les deux autres tests auraient donné une fausse impression de sécurité."
      ],
      explain: "Corrige > en >= et relance : les trois lignes passent à OK. xUnit fera la même chose, en mieux : rapport clair, exécution automatique, intégration à l'IDE."
    },
    {
      title: "Rendre une méthode testable",
      code: `// Version difficile à tester : dépend de l'heure réelle
bool IsHappyHourNow() => DateTime.Now.Hour is >= 17 and < 19;

// Version testable : l'heure est un paramètre
bool IsHappyHour(DateTime now) => now.Hour is >= 17 and < 19;

// Avec la version testable, on choisit les cas à vérifier
Console.WriteLine(IsHappyHour(new DateTime(2026, 1, 1, 16, 59, 0))); // juste avant
Console.WriteLine(IsHappyHour(new DateTime(2026, 1, 1, 17, 0, 0)));  // pile au début
Console.WriteLine(IsHappyHour(new DateTime(2026, 1, 1, 18, 59, 0))); // juste avant la fin
Console.WriteLine(IsHappyHour(new DateTime(2026, 1, 1, 19, 0, 0)));  // terminé

// Impossible de savoir à l'avance ce que ceci renverra
_ = IsHappyHourNow();`,
      output: `False
True
True
False`,
      steps: [
        "<code>bool IsHappyHourNow() =&gt; DateTime.Now.Hour …</code> : le résultat dépend du moment où le test tourne. Un test écrit à 18 h passerait, puis échouerait la nuit.",
        "<code>bool IsHappyHour(DateTime now)</code> : même logique, mais l'heure vient de l'extérieur. Le code appelant passera <code>DateTime.Now</code>, le test passera l'heure de son choix.",
        "<code>is &gt;= 17 and &lt; 19</code> : un <em>pattern</em> C# qui se lit « entre 17 inclus et 19 exclu ».",
        "<code>new DateTime(2026, 1, 1, 16, 59, 0)</code> : on teste les quatre cas limites autour des bornes.",
        "<code>_ = IsHappyHourNow();</code> : le <code>_</code> ignore le résultat. Ce résultat change selon l'heure : impossible d'écrire un test fiable dessus."
      ],
      explain: ".NET fournit aussi la classe TimeProvider, qu'on injecte comme une dépendance pour remplacer l'heure dans les tests : c'est la même idée à l'échelle d'une application."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger le bug, ajouter un cas",
      prompt: `<p>Dans l'exemple 1, corrige <code>ApplyDiscount</code> pour que les trois tests passent. Ajoute un quatrième test : un panier de <code>99.99m</code> ne doit pas avoir de remise.</p>`,
      hint: `<p>Remplace <code>&gt;</code> par <code>&gt;=</code>. Le nouveau test est juste un appel de plus à <code>Check</code>.</p>`,
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

Check("50 € : pas de remise", ApplyDiscount(50m), 50m);
Check("150 € : remise de 10 %", ApplyDiscount(150m), 135m);
Check("100 € pile : remise de 10 %", ApplyDiscount(100m), 90m);
Check("99.99 € : pas de remise", ApplyDiscount(99.99m), 99.99m);

decimal ApplyDiscount(decimal total) => total >= 100m ? total * 0.9m : total;

void Check(string name, decimal actual, decimal expected)
{
    var status = actual == expected ? "OK   " : "ÉCHEC";
    Console.WriteLine($"{status} {name} (attendu {expected}, obtenu {actual})");
}
// Les quatre lignes affichent OK`
    },
    {
      level: "moyen",
      title: "La livraison gratuite du week-end",
      prompt: `<p>Écris une méthode <code>decimal ShippingCost(DateTime orderDate)</code> testable : la livraison coûte <code>4.90m</code>, mais elle est gratuite le samedi et le dimanche. Vérifie-la avec <code>Check</code> sur un vendredi, un samedi et un dimanche (le 2 janvier 2026 est un vendredi).</p>`,
      hint: `<p><code>orderDate.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday</code>.</p>`,
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

Check("vendredi : payant", ShippingCost(new DateTime(2026, 1, 2)), 4.90m);
Check("samedi : gratuit", ShippingCost(new DateTime(2026, 1, 3)), 0m);
Check("dimanche : gratuit", ShippingCost(new DateTime(2026, 1, 4)), 0m);

decimal ShippingCost(DateTime orderDate) =>
    orderDate.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday ? 0m : 4.90m;

void Check(string name, decimal actual, decimal expected)
{
    var status = actual == expected ? "OK   " : "ÉCHEC";
    Console.WriteLine($"{status} {name} (attendu {expected}, obtenu {actual})");
}`
    },
    {
      level: "difficile",
      title: "Tester une exception à la main",
      prompt: `<p>Écris une petite classe <code>Order</code> avec une propriété <code>Status</code> (string, <code>"Pending"</code> par défaut) et une méthode <code>Cancel()</code> qui lève une <code>InvalidOperationException</code> si le statut vaut <code>"Shipped"</code>, sinon passe le statut à <code>"Cancelled"</code>. Écris deux tests à la main : un qui vérifie l'annulation normale, un qui vérifie que l'exception est bien levée.</p>`,
      hint: `<p>Pour le second test, appelle <code>Cancel()</code> dans un <code>try</code>, mets un booléen à <code>true</code> dans le <code>catch (InvalidOperationException)</code> et vérifie ce booléen.</p>`,
      solution: `var pending = new Order();
pending.Cancel();
Console.WriteLine(pending.Status == "Cancelled" ? "OK    annulation normale" : "ÉCHEC annulation normale");

var shipped = new Order { Status = "Shipped" };
var thrown = false;
try
{
    shipped.Cancel();
}
catch (InvalidOperationException)
{
    thrown = true;
}
Console.WriteLine(thrown ? "OK    exception si expédiée" : "ÉCHEC exception si expédiée");

class Order
{
    public string Status { get; set; } = "Pending";

    public void Cancel()
    {
        if (Status == "Shipped")
            throw new InvalidOperationException("Commande déjà expédiée.");
        Status = "Cancelled";
    }
}`
    }
  ],
  quiz: [
    {
      q: `Dans la pyramide des tests, quels tests doivent être les plus nombreux ?`,
      options: ["Les tests de bout en bout", "Les tests unitaires", "Les tests d'intégration"],
      answer: 1,
      why: `Les tests unitaires sont rapides, stables et précis : ils forment la base large de la pyramide. Les tests de bout en bout sont lents et fragiles, on en garde peu.`
    },
    {
      q: `Que signifie « Act » dans Arrange, Act, Assert ?`,
      options: ["Préparer les données du test", "Vérifier le résultat", "Appeler le code qu'on veut tester"],
      answer: 2,
      why: `Arrange prépare, Act exécute l'action testée, Assert vérifie. Garder ces trois blocs bien séparés rend un test facile à lire.`
    },
    {
      q: `Pourquoi une méthode qui lit <code>DateTime.Now</code> est-elle difficile à tester ?`,
      options: ["Parce que son résultat change selon le moment où le test s'exécute", "Parce que DateTime est un type valeur", "Parce que xUnit interdit les dates"],
      answer: 0,
      why: `Un test doit donner toujours le même résultat. Si l'heure vient de l'intérieur de la méthode, on ne la contrôle pas. On la passe donc en paramètre ou on injecte un <code>TimeProvider</code>.`
    },
    {
      q: `La remise s'applique « à partir de 100 € ». Quel cas de test a le plus de chances de trouver un bug ?`,
      options: ["Un panier de 500 €", "Un panier de 100 € pile", "Un panier de 20 €"],
      answer: 1,
      why: `Les bugs se cachent aux frontières : un <code>&gt;</code> à la place de <code>&gt;=</code> ne se voit que sur la valeur exacte du seuil.`
    }
  ],
  project: `<p><strong>OrderFlow : préparer le terrain des tests.</strong> Liste par écrit cinq règles métier d'OrderFlow qui méritent un test (par exemple : le total d'une commande, l'interdiction d'annuler une commande expédiée, le refus d'une quantité nulle, le stock insuffisant, la remise à partir de 100 €). Pour chacune, note le cas normal et au moins un cas limite. Repère aussi dans ton code un endroit qui utilise <code>DateTime.Now</code> ou <code>DateTime.UtcNow</code> directement (par exemple <code>OrderDate</code>) : c'est un candidat pour recevoir l'heure de l'extérieur.</p>`,
  resources: [
    { label: "Bonnes pratiques des tests unitaires .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/testing/unit-testing-best-practices" },
    { label: "Tests dans .NET : vue d'ensemble (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/testing/" }
  ]
});

// =====================================================================
// Tests unitaires avec xUnit
// =====================================================================
window.COURSE.push({
  key: "tst-xunit",
  title: "Tests unitaires avec xUnit",
  summary: "Tu sauras créer un projet de test xUnit, écrire des tests avec [Fact] et [Theory], vérifier des exceptions et lire le résultat de dotnet test.",
  objectives: [
    "Créer un projet de test et le relier au code à tester",
    "Écrire un test avec [Fact] et les méthodes Assert",
    "Tester plusieurs cas d'un coup avec [Theory] et [InlineData]",
    "Lire un échec de test et le corriger"
  ],
  analogy: `<p>Un <strong>banc d'essai</strong> dans un garage : tu poses le moteur dessus, tu le fais tourner dans des conditions précises, et des cadrans t'indiquent si chaque mesure est dans la norme. Tu n'as pas besoin de monter le moteur dans une voiture pour le tester.</p>
<p>xUnit, c'est ce banc d'essai. Tu y poses une classe, tu l'actionnes, et chaque <code>Assert</code> est un cadran qui passe au vert ou au rouge.</p>`,
  lesson: `<h3>Un projet à part pour les tests</h3>
<p>En .NET, les tests vivent dans un <strong>projet séparé</strong>, qui référence le projet à tester. Le code de production ne contient aucun test et ne dépend pas de xUnit. Pour OrderFlow, on obtient une solution comme celle-ci :</p>
<pre class="diagram">
 OrderFlow.slnx
 |-- OrderFlow.Domain/     Order, Product, règles
 |-- OrderFlow.Api/        endpoints
 +-- OrderFlow.Tests/      tests xUnit
        |-- OrderTests.cs
        +-- OrderRulesTests.cs
 OrderFlow.Tests --référence--&gt; OrderFlow.Domain
</pre>
<p>Trois commandes suffisent : <code>dotnet new xunit -n OrderFlow.Tests</code> crée le projet (avec xUnit déjà installé), <code>dotnet sln add OrderFlow.Tests</code> l'ajoute à la solution, et <code>dotnet add OrderFlow.Tests reference OrderFlow.Domain</code> lui donne accès au code. Ensuite, <code>dotnet test</code> compile et lance tous les tests.</p>
<div class="compare"><div><h4>Angular (Jasmine / Jest)</h4><p><code>describe('Order', () =&gt; { it('sums lines', () =&gt; { expect(total).toBe(25.5); }); });</code></p></div><div><h4>.NET (xUnit)</h4><p>Une classe <code>OrderTests</code>, une méthode <code>[Fact]</code> par test, et <code>Assert.Equal(25.5m, total);</code>.</p></div></div>

<h3>[Fact] : un test, un cas</h3>
<p>Un test xUnit est une méthode publique <code>void</code> (ou <code>async Task</code>) marquée de l'attribut <code>[Fact]</code>. Elle ne prend pas de paramètres. Si elle se termine sans exception, le test est vert. Si un <code>Assert</code> échoue, il lève une exception et le test devient rouge.</p>
<p>Pour le nom, une convention lisible est <code>Méthode_Situation_RésultatAttendu</code>, par exemple <code>Cancel_ShippedOrder_Throws</code>. Quand un test échoue, son nom seul dit déjà ce qui est cassé.</p>
<table>
<tr><th>Assertion</th><th>Vérifie que…</th></tr>
<tr><td><code>Assert.Equal(attendu, obtenu)</code></td><td>les deux valeurs sont égales (attention à l'ordre)</td></tr>
<tr><td><code>Assert.True(condition)</code> / <code>Assert.False(…)</code></td><td>la condition est vraie / fausse</td></tr>
<tr><td><code>Assert.Null(x)</code> / <code>Assert.NotNull(x)</code></td><td>la valeur est nulle / non nulle</td></tr>
<tr><td><code>Assert.Empty(liste)</code> / <code>Assert.Contains(x, liste)</code></td><td>la collection est vide / contient x</td></tr>
<tr><td><code>Assert.Throws&lt;T&gt;(() =&gt; …)</code></td><td>le code lève une exception de type T, et la renvoie</td></tr>
</table>
<div class="tip">Dans <code>Assert.Equal</code>, la valeur <strong>attendue</strong> vient en premier. Si tu les inverses, le test marche quand même, mais le message d'échec dira « Expected » pour la mauvaise valeur et te fera perdre du temps.</div>

<h3>[Theory] : un test, plusieurs cas</h3>
<p>Souvent, tu veux vérifier la même règle avec plusieurs valeurs : 50 €, 100 €, 200 €. Plutôt que trois méthodes presque identiques, xUnit propose <code>[Theory]</code>. La méthode reçoit des paramètres, et chaque attribut <code>[InlineData(…)]</code> fournit un jeu de valeurs. xUnit lance la méthode une fois par <code>InlineData</code> et compte chaque exécution comme un test séparé.</p>
<div class="flow"><span>[InlineData(50, 50)]</span><span>[InlineData(100, 90)]</span><span>[InlineData(200, 180)]</span><span>3 tests dans le rapport</span></div>

<h3>Vérifier une exception</h3>
<p>Une règle métier qui refuse une action se teste aussi. <code>Assert.Throws&lt;InvalidOperationException&gt;(() =&gt; order.Cancel())</code> exécute le code et vérifie qu'il lève exactement ce type d'exception. Si rien n'est levé, ou une autre exception, le test échoue. La méthode renvoie l'exception : tu peux donc aussi vérifier son message. Pour du code asynchrone, utilise <code>await Assert.ThrowsAsync&lt;T&gt;(…)</code>.</p>

<h3>Comment xUnit exécute tes tests</h3>
<p>Détail important : xUnit crée une <strong>nouvelle instance</strong> de ta classe de test pour <em>chaque</em> test. Un champ modifié par un test n'est donc jamais vu par le suivant. Le constructeur de la classe joue le rôle du <code>beforeEach</code> de Jasmine : il prépare un état neuf avant chaque test. Les tests ne doivent jamais dépendre de l'ordre dans lequel ils tournent.</p>
<div class="note">Un test qui échoue doit d'abord être <strong>vu</strong> en rouge. Quand tu écris un test pour une règle déjà codée, casse volontairement la règle une fois pour vérifier que le test le détecte. Un test qui ne peut jamais échouer ne protège rien.</div>`,
  examples: [
    {
      title: "Premiers tests avec [Fact]",
      code: `// Fichier : OrderFlow.Tests/OrderTests.cs
// dotnet new xunit -n OrderFlow.Tests
// dotnet add OrderFlow.Tests reference OrderFlow.Domain
using OrderFlow.Domain;

namespace OrderFlow.Tests;

public class OrderTests
{
    [Fact]
    public void Total_SumsAllLines()
    {
        // Arrange : une commande avec deux lignes
        var order = new Order();
        order.AddLine(productId: 1, quantity: 2, unitPrice: 10m);
        order.AddLine(productId: 2, quantity: 1, unitPrice: 5.5m);

        // Act
        var total = order.Total;

        // Assert
        Assert.Equal(25.5m, total);
    }

    [Fact]
    public void Cancel_PendingOrder_SetsStatusToCancelled()
    {
        var order = new Order();

        order.Cancel();

        Assert.Equal(OrderStatus.Cancelled, order.Status);
    }
}

// Lancer : dotnet test`,
      output: `Réussi!  - échec :     0, réussite :     2, ignorée(s) :     0, total :     2, durée : 36 ms - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>dotnet new xunit -n OrderFlow.Tests</code> : crée le projet de test. Le <code>using Xunit;</code> est déjà global, inutile de l'écrire.",
        "<code>public class OrderTests</code> : une classe de test par classe testée, c'est la convention la plus simple.",
        "<code>[Fact]</code> : marque la méthode comme un test sans paramètres.",
        "<code>order.AddLine(productId: 1, quantity: 2, unitPrice: 10m);</code> : les arguments nommés rendent l'Arrange lisible. 2 × 10 + 1 × 5,5 = 25,5.",
        "<code>Assert.Equal(25.5m, total);</code> : la valeur attendue d'abord, la valeur obtenue ensuite. Le suffixe <code>m</code> fait de 25.5 un <code>decimal</code>, comme <code>Total</code>.",
        "Sortie : <code>dotnet test</code> résume le résultat. La durée varie d'une exécution à l'autre."
      ],
      explain: "La classe Order testée ici a une méthode AddLine qui refuse les quantités nulles, une propriété Total et une méthode Cancel qui refuse d'annuler une commande Shipped."
    },
    {
      title: "Plusieurs cas avec [Theory], et une exception",
      code: `// Fichier : OrderFlow.Tests/OrderRulesTests.cs
using OrderFlow.Domain;

namespace OrderFlow.Tests;

public class OrderRulesTests
{
    [Theory]
    [InlineData(50, 50)]     // sous le seuil : pas de remise
    [InlineData(100, 90)]    // pile au seuil : remise
    [InlineData(200, 180)]
    public void ApplyDiscount_ReturnsExpectedPrice(decimal total, decimal expected)
    {
        var result = PriceCalculator.ApplyDiscount(total);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void Cancel_ShippedOrder_Throws()
    {
        var order = new Order { Status = OrderStatus.Shipped };

        var ex = Assert.Throws<InvalidOperationException>(() => order.Cancel());

        Assert.Contains("expédiée", ex.Message);
    }
}

// Lancer avec le détail : dotnet test --logger "console;verbosity=normal"`,
      output: `  Réussi OrderFlow.Tests.OrderRulesTests.ApplyDiscount_ReturnsExpectedPrice(total: 50, expected: 50) [14 ms]
  Réussi OrderFlow.Tests.OrderRulesTests.ApplyDiscount_ReturnsExpectedPrice(total: 200, expected: 180) [< 1 ms]
  Réussi OrderFlow.Tests.OrderRulesTests.ApplyDiscount_ReturnsExpectedPrice(total: 100, expected: 90) [< 1 ms]
  Réussi OrderFlow.Tests.OrderRulesTests.Cancel_ShippedOrder_Throws [18 ms]

Série de tests réussie.
Nombre total de tests : 4
     Réussi(s) : 4`,
      steps: [
        "<code>[Theory]</code> : la méthode est un test paramétré.",
        "<code>[InlineData(100, 90)]</code> : un jeu de valeurs. xUnit convertit <code>100</code> en <code>decimal</code> pour le paramètre <code>total</code>.",
        "<code>ApplyDiscount_ReturnsExpectedPrice(decimal total, decimal expected)</code> : les paramètres reçoivent les valeurs de chaque <code>InlineData</code>, dans l'ordre.",
        "<code>Assert.Throws&lt;InvalidOperationException&gt;(() =&gt; order.Cancel())</code> : on passe une lambda pour que xUnit puisse appeler le code lui-même et attraper l'exception.",
        "<code>Assert.Contains(\"expédiée\", ex.Message);</code> : on vérifie aussi que le message est le bon.",
        "Sortie : chaque <code>InlineData</code> apparaît comme un test distinct, avec ses valeurs. L'ordre d'exécution n'est pas garanti."
      ],
      explain: "PriceCalculator.ApplyDiscount applique 10 % de remise à partir de 100 € : total >= 100m ? total * 0.9m : total."
    },
    {
      title: "Lire un test en échec",
      code: `// Fichier : OrderFlow.Tests/OrderTests.cs (le test de l'exemple 1, modifié)
// On se trompe volontairement dans la valeur attendue
[Fact]
public void Total_SumsAllLines()
{
    var order = new Order();
    order.AddLine(productId: 1, quantity: 2, unitPrice: 10m);
    order.AddLine(productId: 2, quantity: 1, unitPrice: 5.5m);

    var total = order.Total;

    Assert.Equal(26m, total);   // faux : le vrai total est 25,5
}

// Lancer : dotnet test`,
      output: `[xUnit.net 00:00:00.36]     OrderFlow.Tests.OrderTests.Total_SumsAllLines [FAIL]
  Échoué OrderFlow.Tests.OrderTests.Total_SumsAllLines [14 ms]
  Message d'erreur :
   Assert.Equal() Failure: Values differ
Expected: 26
Actual:   25,5
  Arborescence des appels de procédure :
     at OrderFlow.Tests.OrderTests.Total_SumsAllLines() in OrderFlow.Tests\\OrderTests.cs:line 22

Échoué!  - échec :     1, réussite :     1, ignorée(s) :     0, total :     2, durée : 65 ms - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>Assert.Equal(26m, total);</code> : on attend 26, mais le code calcule 25,5.",
        "Sortie, <code>[FAIL]</code> : le nom complet du test qui échoue (espace de noms, classe, méthode).",
        "Sortie, <code>Expected: 26</code> / <code>Actual: 25,5</code> : ce que tu attendais, ce que tu as obtenu. C'est pour ça que l'ordre des paramètres d'<code>Assert.Equal</code> compte.",
        "Sortie, <code>line 22</code> : la ligne exacte de l'assertion dans le fichier complet de l'exemple 1, chemin complet compris (raccourci ici), cliquable dans l'IDE.",
        "Sortie, dernière ligne : le résumé passe à <code>Échoué!</code>. Dans un pipeline d'intégration continue, ce rouge bloque la fusion du code."
      ],
      explain: "Ici c'est le test qui avait tort. Quand un test échoue, demande-toi toujours qui se trompe : le code ou le test."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une commande vide",
      prompt: `<p>Écris un test <code>Total_EmptyOrder_IsZero</code> qui vérifie qu'une commande sans ligne a un total de 0.</p>`,
      hint: `<p>Pas besoin d'Act séparé : <code>Assert.Equal(0m, order.Total);</code>.</p>`,
      solution: `[Fact]
public void Total_EmptyOrder_IsZero()
{
    var order = new Order();

    Assert.Equal(0m, order.Total);
}`
    },
    {
      level: "moyen",
      title: "Les quantités interdites",
      prompt: `<p>Écris une <code>[Theory]</code> qui vérifie que <code>AddLine</code> lève une <code>ArgumentOutOfRangeException</code> pour les quantités 0, -1 et -5. Vérifie aussi que la commande reste sans ligne.</p>`,
      hint: `<p>Un seul paramètre <code>int quantity</code> et trois <code>[InlineData]</code>. Puis <code>Assert.Empty(order.Lines)</code>.</p>`,
      solution: `[Theory]
[InlineData(0)]
[InlineData(-1)]
[InlineData(-5)]
public void AddLine_InvalidQuantity_Throws(int quantity)
{
    var order = new Order();

    Assert.Throws<ArgumentOutOfRangeException>(() => order.AddLine(1, quantity, 10m));
    Assert.Empty(order.Lines);
}`
    },
    {
      level: "difficile",
      title: "Une nouvelle règle, testée d'abord",
      prompt: `<p>Nouvelle règle : une commande ne peut être expédiée que si elle est payée. Écris <strong>d'abord</strong> deux tests pour une méthode <code>MarkAsShipped()</code> : une commande <code>Paid</code> passe à <code>Shipped</code> ; une commande <code>Pending</code> lève une <code>InvalidOperationException</code> et garde son statut. Lance-les (ils ne compilent pas), puis écris la méthode dans <code>Order</code> jusqu'à ce qu'ils passent.</p>`,
      hint: `<p>Dans <code>Order</code> : <code>if (Status != OrderStatus.Paid) throw new InvalidOperationException(…); Status = OrderStatus.Shipped;</code>. Écrire le test avant le code s'appelle le TDD (Test-Driven Development).</p>`,
      solution: `// Fichier : OrderFlow.Tests/OrderTests.cs
[Fact]
public void MarkAsShipped_PaidOrder_SetsShipped()
{
    var order = new Order { Status = OrderStatus.Paid };

    order.MarkAsShipped();

    Assert.Equal(OrderStatus.Shipped, order.Status);
}

[Fact]
public void MarkAsShipped_PendingOrder_Throws()
{
    var order = new Order();

    Assert.Throws<InvalidOperationException>(() => order.MarkAsShipped());
    Assert.Equal(OrderStatus.Pending, order.Status);
}

// Fichier : OrderFlow.Domain/Order.cs (dans la classe Order)
public void MarkAsShipped()
{
    if (Status != OrderStatus.Paid)
        throw new InvalidOperationException("Seule une commande payée peut être expédiée.");
    Status = OrderStatus.Shipped;
}`
    }
  ],
  quiz: [
    {
      q: `Quel attribut utiliser pour lancer le même test avec plusieurs jeux de valeurs ?`,
      options: ["<code>[Fact]</code> répété plusieurs fois", "<code>[Theory]</code> avec des <code>[InlineData]</code>", "<code>[TestCase]</code>"],
      answer: 1,
      why: `<code>[Theory]</code> marque un test paramétré, et chaque <code>[InlineData]</code> fournit un jeu de valeurs. <code>[TestCase]</code> existe dans NUnit, pas dans xUnit.`
    },
    {
      q: `Dans <code>Assert.Equal(a, b)</code>, que doit être <code>a</code> ?`,
      options: ["La valeur attendue", "La valeur obtenue par le code", "Peu importe, aucune différence"],
      answer: 0,
      why: `Le résultat du test est le même dans les deux sens, mais le message d'échec affiche <code>Expected</code> pour le premier paramètre. Les inverser rend le diagnostic trompeur.`
    },
    {
      q: `Combien d'instances de la classe de test xUnit crée-t-il pour une classe qui contient 3 tests ?`,
      options: ["Une seule, partagée", "Deux", "Trois : une par test"],
      answer: 2,
      why: `xUnit crée une instance neuve pour chaque test. Le constructeur sert donc de préparation commune, comme <code>beforeEach</code> en Jasmine, et aucun état ne fuit d'un test à l'autre.`
    },
    {
      q: `Comment vérifier qu'une méthode asynchrone lève une exception ?`,
      options: ["<code>Assert.Throws&lt;T&gt;(…)</code>", "<code>await Assert.ThrowsAsync&lt;T&gt;(…)</code>", "Avec un <code>try/catch</code> obligatoirement"],
      answer: 1,
      why: `Pour une méthode qui renvoie une <code>Task</code>, l'exception n'apparaît qu'en attendant la tâche : il faut <code>ThrowsAsync</code> et <code>await</code>, et le test devient <code>async Task</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : les premiers tests.</strong> Crée le projet <code>OrderFlow.Tests</code> avec <code>dotnet new xunit</code>, ajoute-le à la solution et référence le projet qui contient tes classes métier (<code>Order</code>, <code>OrderLine</code>). Écris au moins cinq tests sur les règles que tu as listées à la leçon précédente : total de la commande, quantité invalide, annulation interdite d'une commande expédiée, et une <code>[Theory]</code> sur la remise. Lance <code>dotnet test</code> jusqu'à obtenir <code>Réussi!</code>, puis casse volontairement une règle pour voir un test passer au rouge.</p>`,
  resources: [
    { label: "Tests unitaires C# avec xUnit (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/testing/unit-testing-csharp-with-xunit" },
    { label: "Documentation xUnit.net", url: "https://xunit.net/docs/getting-started/v2/getting-started" }
  ]
});

// =====================================================================
// Isoler une dépendance avec NSubstitute
// =====================================================================
window.COURSE.push({
  key: "tst-mocks",
  title: "Isoler une dépendance avec NSubstitute",
  summary: "Tu sauras tester un service qui dépend d'une base ou d'un serveur mail, en remplaçant ces dépendances par des doublures NSubstitute.",
  objectives: [
    "Comprendre pourquoi on remplace une dépendance dans un test unitaire",
    "Créer une doublure avec Substitute.For et lui dicter ses réponses avec Returns",
    "Vérifier qu'une méthode a été appelée avec Received et DidNotReceive",
    "Utiliser Arg.Any et Arg.Is pour assouplir les vérifications"
  ],
  analogy: `<p>Au cinéma, pour une scène dangereuse, on remplace l'acteur par une <strong>doublure</strong>. Elle a la même silhouette, elle fait exactement ce que le réalisateur lui dit, et on peut refaire la scène vingt fois sans risque.</p>
<p>Dans un test, la vraie base de données et le vrai serveur mail sont les acteurs qu'on ne veut pas mettre en danger. NSubstitute fabrique des doublures qui ont la même « silhouette » (la même interface) et qui répondent exactement ce que ton test leur dicte.</p>`,
  lesson: `<h3>Le problème : un service qui dépend du monde</h3>
<p>Le service <code>OrderService</code> d'OrderFlow passe une commande : il charge le produit depuis la base (via <code>IProductRepository</code>), vérifie le stock, crée la commande et envoie un email de confirmation (via <code>IEmailSender</code>). Pour le tester en unitaire, on ne veut ni vraie base, ni vrai email : ce serait lent, fragile, et chaque test enverrait un mail !</p>
<p>Bonne nouvelle : grâce à l'injection de dépendances, <code>OrderService</code> ne connaît que des <strong>interfaces</strong>. Dans le test, on peut donc lui donner d'autres objets qui respectent ces interfaces : des <strong>doublures de test</strong> (en anglais <em>test doubles</em>).</p>
<div class="compare"><div><h4>En production</h4><p><code>OrderService</code> reçoit un <code>EfProductRepository</code> (la vraie base) et un <code>SmtpEmailSender</code> (le vrai serveur mail).</p></div><div><h4>Dans le test</h4><p><code>OrderService</code> reçoit deux doublures NSubstitute, contrôlées par le test.</p></div></div>

<h3>Stub ou mock ?</h3>
<p>On distingue deux usages d'une doublure. Un <strong>stub</strong> (bouchon) <em>fournit des données</em> au code testé : « quand on te demande le produit 1, réponds ce clavier ». Un <strong>mock</strong> (espion) <em>enregistre les appels</em> pour qu'on les vérifie ensuite : « as-tu bien reçu un appel à <code>SendAsync</code> avec cette adresse ? ». Avec NSubstitute, le même objet peut jouer les deux rôles.</p>
<p>Tu pourrais écrire ces doublures à la main : une classe <code>FakeEmailSender : IEmailSender</code> qui range les appels dans une liste. Ça marche, mais il faut une classe par interface et par scénario. NSubstitute les fabrique pour toi, en une ligne.</p>

<h3>Les trois gestes de NSubstitute</h3>
<p>On installe le package dans le projet de test : <code>dotnet add package NSubstitute</code>. Puis tout tient en trois gestes.</p>
<div class="flow"><span>Créer : Substitute.For&lt;IEmailSender&gt;()</span><span>Programmer : .Returns(…)</span><span>Vérifier : .Received(1).SendAsync(…)</span></div>
<table>
<tr><th>Code</th><th>Effet</th></tr>
<tr><td><code>var repo = Substitute.For&lt;IProductRepository&gt;();</code></td><td>Crée une doublure qui implémente l'interface. Par défaut, chaque méthode renvoie une valeur vide (<code>null</code>, 0, liste vide).</td></tr>
<tr><td><code>repo.GetByIdAsync(1).Returns(keyboard);</code></td><td>Quand on appelle <code>GetByIdAsync(1)</code>, renvoyer <code>keyboard</code>. NSubstitute enveloppe la valeur dans une <code>Task</code> tout seul.</td></tr>
<tr><td><code>await email.Received(1).SendAsync("a@b.c", "Sujet");</code></td><td>Échoue si <code>SendAsync</code> n'a pas été appelée exactement une fois avec ces arguments.</td></tr>
<tr><td><code>await email.DidNotReceive().SendAsync(Arg.Any&lt;string&gt;(), Arg.Any&lt;string&gt;());</code></td><td>Échoue si <code>SendAsync</code> a été appelée, avec n'importe quels arguments.</td></tr>
</table>
<p><code>Arg.Any&lt;T&gt;()</code> accepte n'importe quelle valeur. <code>Arg.Is&lt;T&gt;(x =&gt; condition)</code> accepte les valeurs qui respectent une condition, par exemple <code>Arg.Is&lt;string&gt;(to =&gt; to.EndsWith("@orderflow.dev"))</code>.</p>
<div class="tip">En Angular, tu as sûrement utilisé <code>jasmine.createSpyObj</code> ou <code>jest.fn()</code> pour remplacer un service dans un test. NSubstitute, c'est la même chose : <code>Returns</code> ≈ <code>and.returnValue</code> / <code>mockReturnValue</code>, et <code>Received</code> ≈ <code>toHaveBeenCalledWith</code>.</div>

<h3>Ce qu'on peut remplacer</h3>
<p>NSubstitute remplace facilement les <strong>interfaces</strong>. Il ne peut pas remplacer une méthode non virtuelle d'une classe concrète, ni une méthode statique. C'est une raison de plus pour faire dépendre tes services d'interfaces (<code>IProductRepository</code>, <code>IEmailSender</code>) plutôt que de classes concrètes ou de <code>static</code>.</p>
<pre class="diagram">
 OrderService
   |-- IProductRepository  --&gt; doublure : Returns(keyboard)
   +-- IEmailSender        --&gt; doublure : Received(1) ?
</pre>
<div class="note">Ne remplace que ce qui sort de ton code : base de données, réseau, email, horloge. Les objets métier simples (<code>Order</code>, <code>Product</code>) s'utilisent pour de vrai. Et vérifie surtout les <em>effets</em> qui comptent (un email envoyé, un stock diminué) plutôt que chaque appel interne : sinon le moindre refactoring casse des dizaines de tests sans qu'aucun comportement n'ait changé.</div>`,
  examples: [
    {
      title: "Le service à tester",
      code: `// Fichier : OrderFlow.Domain/OrderService.cs
namespace OrderFlow.Domain;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<List<Product>> GetAllAsync();
}

public interface IEmailSender
{
    Task SendAsync(string to, string subject);
}

public class OrderService(IProductRepository products, IEmailSender email)
{
    public async Task<Order> PlaceOrderAsync(string customerEmail, int productId, int quantity)
    {
        var product = await products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException($"Produit {productId} introuvable.");
        if (product.Stock < quantity)
            throw new InvalidOperationException("Stock insuffisant.");

        var order = new Order();
        order.AddLine(product.Id, quantity, product.Price);
        product.Stock -= quantity;

        await email.SendAsync(customerEmail, "Commande confirmée");
        return order;
    }
}`,
      output: ``,
      steps: [
        "<code>public interface IProductRepository</code> : l'accès aux produits est décrit par une interface. En production, une classe EF Core l'implémente.",
        "<code>public interface IEmailSender</code> : même chose pour l'envoi d'emails.",
        "<code>OrderService(IProductRepository products, IEmailSender email)</code> : le service reçoit ses dépendances par son constructeur principal. Il ne sait pas s'il parle à une vraie base ou à une doublure.",
        "<code>?? throw new KeyNotFoundException(…)</code> : si le produit n'existe pas, on lève une exception.",
        "<code>if (product.Stock &lt; quantity) throw …</code> : la règle du stock.",
        "<code>await email.SendAsync(customerEmail, \"Commande confirmée\");</code> : l'effet de bord qu'on voudra vérifier sans envoyer de vrai email."
      ],
      explain: "Rien ne s'affiche : c'est le code à tester. Il y a trois comportements à vérifier : succès, stock insuffisant, produit inconnu."
    },
    {
      title: "Programmer une réponse, vérifier un appel",
      code: `// Fichier : OrderFlow.Tests/OrderServiceTests.cs
// dotnet add package NSubstitute
using NSubstitute;
using OrderFlow.Domain;

namespace OrderFlow.Tests;

public class OrderServiceTests
{
    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IEmailSender _email = Substitute.For<IEmailSender>();
    private readonly OrderService _service;

    public OrderServiceTests() => _service = new OrderService(_products, _email);

    [Fact]
    public async Task PlaceOrder_EnoughStock_DecreasesStockAndSendsEmail()
    {
        // Arrange : le dépôt renverra ce clavier pour l'id 1
        var keyboard = new Product { Id = 1, Name = "Clavier", Price = 49.90m, Stock = 10 };
        _products.GetByIdAsync(1).Returns(keyboard);

        // Act
        var order = await _service.PlaceOrderAsync("alice@orderflow.dev", 1, 3);

        // Assert
        Assert.Equal(149.70m, order.Total);
        Assert.Equal(7, keyboard.Stock);
        await _email.Received(1).SendAsync("alice@orderflow.dev", "Commande confirmée");
    }
}

// Lancer : dotnet test`,
      output: `Réussi!  - échec :     0, réussite :     1, ignorée(s) :     0, total :     1, durée : 172 ms - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>Substitute.For&lt;IProductRepository&gt;()</code> : crée une doublure de l'interface. Les champs sont recréés pour chaque test, puisque xUnit crée une instance par test.",
        "<code>public OrderServiceTests() =&gt; _service = new OrderService(_products, _email);</code> : le constructeur prépare le service avec ses deux doublures.",
        "<code>_products.GetByIdAsync(1).Returns(keyboard);</code> : on programme le stub. Sans cette ligne, l'appel renverrait <code>null</code>.",
        "<code>Assert.Equal(7, keyboard.Stock);</code> : 10 en stock, 3 commandés : il en reste 7. On vérifie l'effet sur l'objet renvoyé par la doublure.",
        "<code>await _email.Received(1).SendAsync(…)</code> : on vérifie que l'email est parti une fois, à la bonne adresse, avec le bon sujet. Le <code>await</code> est là car <code>SendAsync</code> renvoie une <code>Task</code>.",
        "Sortie : avec les deux tests de l'exemple 3, <code>dotnet test</code> annonce <code>réussite : 3</code>."
      ]
    },
    {
      title: "Les cas d'erreur et un message d'échec",
      code: `// Fichier : OrderFlow.Tests/OrderServiceTests.cs (dans la même classe)
[Fact]
public async Task PlaceOrder_NotEnoughStock_ThrowsAndSendsNoEmail()
{
    _products.GetByIdAsync(2).Returns(new Product { Id = 2, Stock = 0 });

    await Assert.ThrowsAsync<InvalidOperationException>(
        () => _service.PlaceOrderAsync("bob@orderflow.dev", 2, 1));

    await _email.DidNotReceive().SendAsync(Arg.Any<string>(), Arg.Any<string>());
}

[Fact]
public async Task PlaceOrder_UnknownProduct_ThrowsKeyNotFound()
{
    _products.GetByIdAsync(Arg.Any<int>()).Returns((Product?)null);

    await Assert.ThrowsAsync<KeyNotFoundException>(
        () => _service.PlaceOrderAsync("bob@orderflow.dev", 99, 1));
}

// Si, dans l'exemple 2, on attendait le sujet "Commande validée" :`,
      output: `   NSubstitute.Exceptions.ReceivedCallsException : Expected to receive exactly 1 call matching:
	SendAsync("alice@orderflow.dev", "Commande validée")
Actually received no matching calls.
Received 1 non-matching call (non-matching arguments indicated with '*' characters):
	SendAsync("alice@orderflow.dev", *"Commande confirmée"*)`,
      steps: [
        "<code>new Product { Id = 2, Stock = 0 }</code> : le stub renvoie un produit en rupture de stock.",
        "<code>await Assert.ThrowsAsync&lt;InvalidOperationException&gt;(…)</code> : la commande doit être refusée.",
        "<code>_email.DidNotReceive().SendAsync(Arg.Any&lt;string&gt;(), Arg.Any&lt;string&gt;())</code> : aucun email ne doit partir, quelle que soit l'adresse ou le sujet.",
        "<code>.Returns((Product?)null)</code> : on programme explicitement « produit introuvable » pour n'importe quel id. Le cast indique le type de <code>null</code> au compilateur.",
        "Sortie : quand une vérification <code>Received</code> échoue, NSubstitute liste les appels réellement reçus et entoure d'étoiles <code>*…*</code> l'argument qui ne correspond pas. Le diagnostic est immédiat."
      ],
      explain: "Les trois comportements du service sont couverts, en quelques millisecondes, sans base ni serveur mail."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Pas d'email pour un produit inconnu",
      prompt: `<p>Complète le test <code>PlaceOrder_UnknownProduct_ThrowsKeyNotFound</code> de l'exemple 3 : vérifie aussi qu'aucun email n'a été envoyé.</p>`,
      hint: `<p>Même ligne que dans le test du stock insuffisant, avec <code>DidNotReceive()</code>.</p>`,
      solution: `[Fact]
public async Task PlaceOrder_UnknownProduct_ThrowsKeyNotFound()
{
    _products.GetByIdAsync(Arg.Any<int>()).Returns((Product?)null);

    await Assert.ThrowsAsync<KeyNotFoundException>(
        () => _service.PlaceOrderAsync("bob@orderflow.dev", 99, 1));

    await _email.DidNotReceive().SendAsync(Arg.Any<string>(), Arg.Any<string>());
}`
    },
    {
      level: "moyen",
      title: "Vérifier un argument avec une condition",
      prompt: `<p>Écris un test qui passe une commande pour <code>alice@orderflow.dev</code> et vérifie, avec <code>Arg.Is</code>, que l'email est envoyé à une adresse qui se termine par <code>@orderflow.dev</code>, quel que soit le sujet.</p>`,
      hint: `<p><code>Received(1).SendAsync(Arg.Is&lt;string&gt;(to =&gt; to.EndsWith("@orderflow.dev")), Arg.Any&lt;string&gt;())</code>.</p>`,
      solution: `[Fact]
public async Task PlaceOrder_SendsEmailToCustomerDomain()
{
    _products.GetByIdAsync(1).Returns(new Product { Id = 1, Price = 10m, Stock = 5 });

    await _service.PlaceOrderAsync("alice@orderflow.dev", 1, 1);

    await _email.Received(1).SendAsync(
        Arg.Is<string>(to => to.EndsWith("@orderflow.dev")),
        Arg.Any<string>());
}`
    },
    {
      level: "difficile",
      title: "Quand le serveur mail tombe",
      prompt: `<p>Programme la doublure <code>IEmailSender</code> pour qu'elle lève une <code>InvalidOperationException("SMTP indisponible")</code>. Vérifie que <code>PlaceOrderAsync</code> laisse passer l'exception, et observe l'état du stock : 5 en stock, 2 commandés. Que vaut <code>Stock</code> après l'échec ? Est-ce souhaitable ?</p>`,
      hint: `<p>Ajoute <code>using NSubstitute.ExceptionExtensions;</code> puis <code>_email.SendAsync(Arg.Any&lt;string&gt;(), Arg.Any&lt;string&gt;()).ThrowsAsync(new InvalidOperationException("SMTP indisponible"));</code>.</p>`,
      solution: `using NSubstitute.ExceptionExtensions;

[Fact]
public async Task PlaceOrder_EmailFails_ExceptionPropagates()
{
    var keyboard = new Product { Id = 1, Price = 10m, Stock = 5 };
    _products.GetByIdAsync(1).Returns(keyboard);
    _email.SendAsync(Arg.Any<string>(), Arg.Any<string>())
          .ThrowsAsync(new InvalidOperationException("SMTP indisponible"));

    await Assert.ThrowsAsync<InvalidOperationException>(
        () => _service.PlaceOrderAsync("alice@orderflow.dev", 1, 2));

    // Le stock a déjà été diminué alors que la commande a échoué : 3 au lieu de 5.
    // Le test révèle un vrai problème de conception : il faudrait envoyer l'email
    // après l'enregistrement en base, ou ne pas faire échouer la commande pour un email.
    Assert.Equal(3, keyboard.Stock);
}`
    }
  ],
  quiz: [
    {
      q: `Que renvoie par défaut <code>repo.GetByIdAsync(5)</code> sur une doublure NSubstitute qu'on n'a pas programmée ?`,
      options: ["Une exception", "Un produit avec des valeurs aléatoires", "<code>null</code> (dans une Task terminée)"],
      answer: 2,
      why: `Une doublure non programmée renvoie une valeur vide : <code>null</code> pour un objet, 0 pour un nombre, une collection vide. Pour une méthode asynchrone, elle renvoie une <code>Task</code> déjà terminée avec cette valeur.`
    },
    {
      q: `Quelle ligne vérifie qu'un email a été envoyé exactement une fois ?`,
      options: ["<code>_email.SendAsync(…).Returns(1);</code>", "<code>await _email.Received(1).SendAsync(…);</code>", "<code>Assert.Equal(1, _email.Count);</code>"],
      answer: 1,
      why: `<code>Received(1)</code> vérifie le nombre d'appels avec les arguments donnés. <code>Returns</code> programme une réponse, il ne vérifie rien.`
    },
    {
      q: `Quelle différence entre un stub et un mock ?`,
      options: ["Le stub fournit des données au code testé, le mock sert à vérifier les appels reçus", "Le stub est plus rapide que le mock", "Aucune, ce sont deux noms pour le même outil"],
      answer: 0,
      why: `Le stub répond (« voici le produit »), le mock espionne (« as-tu été appelé ? »). NSubstitute fait les deux avec le même objet, mais distinguer les rôles aide à écrire des tests clairs.`
    },
    {
      q: `Pourquoi NSubstitute a-t-il besoin que <code>OrderService</code> dépende d'<em>interfaces</em> ?`,
      options: ["Parce que les interfaces sont plus rapides", "Parce qu'il ne peut pas remplacer les méthodes non virtuelles ou statiques d'une classe concrète", "Parce que xUnit l'exige"],
      answer: 1,
      why: `NSubstitute fabrique un objet qui implémente l'interface. Une méthode statique ou non virtuelle d'une classe concrète ne peut pas être interceptée. Dépendre d'interfaces rend le code testable.`
    }
  ],
  project: `<p><strong>OrderFlow : tester le service de commande.</strong> Si ce n'est pas déjà fait, fais dépendre ton service de commande d'interfaces (<code>IProductRepository</code>, <code>IEmailSender</code> ou <code>IOrderRepository</code>). Ajoute NSubstitute au projet <code>OrderFlow.Tests</code> et écris trois tests : commande réussie (stock diminué, email ou enregistrement vérifié avec <code>Received</code>), stock insuffisant (exception et <code>DidNotReceive</code>), produit inconnu. Aucun test ne doit toucher la vraie base : <code>dotnet test</code> doit passer même si SQL Server est arrêté.</p>`,
  resources: [
    { label: "NSubstitute : prise en main (documentation officielle)", url: "https://nsubstitute.github.io/help/getting-started/" },
    { label: "Bonnes pratiques des tests unitaires .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/testing/unit-testing-best-practices" }
  ]
});

// =====================================================================
// Tests d'intégration d'une API avec WebApplicationFactory
// =====================================================================
window.COURSE.push({
  key: "tst-integration",
  title: "Tests d'intégration d'une API avec WebApplicationFactory",
  summary: "Tu sauras démarrer ton API en mémoire dans un test, l'appeler avec un HttpClient et remplacer un service pour contrôler les données.",
  objectives: [
    "Comprendre ce qu'un test d'intégration vérifie de plus qu'un test unitaire",
    "Démarrer l'API en mémoire avec WebApplicationFactory",
    "Vérifier le code HTTP et le JSON d'une réponse",
    "Remplacer un service de l'API avec ConfigureTestServices"
  ],
  analogy: `<p>Un constructeur automobile teste chaque pièce sur un banc : c'est le test unitaire. Mais avant de livrer, il monte toutes les pièces et fait rouler la voiture sur une <strong>piste d'essai fermée</strong>. Pas sur la vraie route, pas avec de vrais clients, mais avec le vrai moteur, la vraie boîte de vitesses et les vrais freins, ensemble.</p>
<p><code>WebApplicationFactory</code>, c'est cette piste d'essai : ton API complète tourne, mais dans un circuit fermé, en mémoire, contrôlé par ton test.</p>`,
  lesson: `<h3>Ce que les tests unitaires ne voient pas</h3>
<p>Tes tests unitaires prouvent que <code>Order</code> et <code>OrderService</code> font le bon calcul. Mais ils ne voient pas si la route s'écrit bien <code>/api/products/{id}</code>, si un service est bien enregistré dans la DI, si le JSON renvoyé a les bons noms de propriétés ou si le middleware d'authentification bloque bien les anonymes. Ce sont des erreurs d'<strong>assemblage</strong>, et elles sont fréquentes.</p>
<p>Un <strong>test d'intégration</strong> vérifie l'assemblage : il envoie une vraie requête HTTP à l'API et regarde la vraie réponse. Il est plus lent qu'un test unitaire (quelques centaines de millisecondes), d'où sa place au milieu de la pyramide.</p>

<h3>L'API démarrée en mémoire</h3>
<p>Le package <code>Microsoft.AspNetCore.Mvc.Testing</code> fournit <code>WebApplicationFactory&lt;Program&gt;</code>. Cette classe exécute ton <code>Program.cs</code> exactement comme <code>dotnet run</code> : configuration, DI, middlewares, endpoints. Mais au lieu d'ouvrir un port réseau, elle utilise un <strong>serveur de test en mémoire</strong>. <code>factory.CreateClient()</code> te donne un <code>HttpClient</code> branché directement dessus.</p>
<div class="flow"><span>Test xUnit</span><span>HttpClient de test</span><span>Serveur en mémoire (TestServer)</span><span>Ton Program.cs complet</span></div>
<p>Pas de port à choisir, pas de serveur à lancer à côté, pas de <code>curl</code> : le test fait tout. C'est l'équivalent des tests qui utilisent <code>HttpTestingController</code> en Angular, mais à l'envers : ici, c'est le <em>serveur</em> qui est réel.</p>
<div class="tip">Le paramètre de type <code>Program</code> désigne ton API. Avec les top-level statements, la classe <code>Program</code> est générée par le compilateur ; en .NET 10, elle est rendue publique automatiquement pour les tests. Sur des versions plus anciennes, il fallait ajouter <code>public partial class Program { }</code> à la fin de <code>Program.cs</code>.</div>

<h3>Mettre en place le projet</h3>
<p>Dans le projet <code>OrderFlow.Tests</code>, ajoute le package et une référence vers l'API :</p>
<table>
<tr><th>Commande</th><th>Rôle</th></tr>
<tr><td><code>dotnet add package Microsoft.AspNetCore.Mvc.Testing</code></td><td>Fournit <code>WebApplicationFactory</code> et le serveur de test</td></tr>
<tr><td><code>dotnet add reference ../OrderFlow.Api</code></td><td>Donne accès à <code>Program</code> et aux types de l'API</td></tr>
</table>
<p>Démarrer l'API coûte un peu de temps. Pour ne pas la redémarrer à chaque test, la classe de test implémente <code>IClassFixture&lt;WebApplicationFactory&lt;Program&gt;&gt;</code> : xUnit crée <strong>une seule</strong> factory pour tous les tests de la classe et la passe au constructeur. C'est un <em>fixture</em> : un équipement partagé.</p>

<h3>Remplacer un service pour le test</h3>
<p>Souvent, on ne veut pas que le test d'intégration touche la vraie base ou le vrai serveur mail. <code>factory.WithWebHostBuilder(…)</code> crée une variante de l'API, et <code>ConfigureTestServices</code> permet d'enregistrer d'autres services <strong>après</strong> ceux de <code>Program.cs</code>. Quand un service est enregistré deux fois, la DI utilise le dernier : ta doublure gagne.</p>
<pre class="diagram">
 Program.cs   : IProductRepository -&gt; InMemory (ou EF)
 Test         : IProductRepository -&gt; doublure
                        |
 La DI prend le dernier enregistrement : la doublure
</pre>
<p>Tu peux réutiliser NSubstitute pour créer cette doublure, ou une vraie base de test (une base SQL Server dédiée, ou un conteneur lancé avec Testcontainers). Les deux approches se complètent : la doublure pour tester l'API seule, la vraie base pour vérifier les requêtes EF Core.</p>

<h3>Que vérifier ?</h3>
<ul>
<li>Le <strong>code HTTP</strong> : 200, 201, 400, 401, 404… C'est le contrat de ton API avec le front Angular.</li>
<li>Le <strong>corps JSON</strong>, lu avec <code>ReadFromJsonAsync&lt;T&gt;()</code> ou <code>GetFromJsonAsync&lt;T&gt;()</code>.</li>
<li>Les règles transversales : un endpoint protégé renvoie bien 401 sans jeton, une validation renvoie bien 400.</li>
</ul>
<div class="note">Garde les tests indépendants : chaque test crée ses propres données, ou utilise sa propre doublure, et ne compte pas sur ce qu'un autre test a créé. Avec une vraie base partagée, nettoie-la entre les tests (ou utilise une transaction annulée à la fin), sinon les tests réussiront seuls et échoueront ensemble, le pire des bugs à diagnostiquer.</div>`,
  examples: [
    {
      title: "L'API à tester",
      code: `// Fichier : OrderFlow.Api/Program.cs
using OrderFlow.Domain;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();

var app = builder.Build();

app.MapGet("/api/products", (IProductRepository repo) => repo.GetAllAsync());

app.MapGet("/api/products/{id:int}", async (int id, IProductRepository repo) =>
    await repo.GetByIdAsync(id) is { } product
        ? Results.Ok(product)
        : Results.NotFound());

app.Run();

class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _products =
    [
        new() { Id = 1, Name = "Clavier", Price = 49.90m, Stock = 10 },
        new() { Id = 2, Name = "Souris", Price = 19.90m, Stock = 0 }
    ];

    public Task<Product?> GetByIdAsync(int id) =>
        Task.FromResult(_products.FirstOrDefault(p => p.Id == id));

    public Task<List<Product>> GetAllAsync() => Task.FromResult(_products);
}

// curl -i http://localhost:5080/api/products`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Clavier","price":49.90,"stock":10},{"id":2,"name":"Souris","price":19.90,"stock":0}]`,
      steps: [
        "<code>AddSingleton&lt;IProductRepository, InMemoryProductRepository&gt;()</code> : l'API dépend de l'interface de la leçon précédente. Dans OrderFlow, ce serait l'implémentation EF Core.",
        "<code>app.MapGet(\"/api/products\", …)</code> : renvoie tous les produits en JSON.",
        "<code>await repo.GetByIdAsync(id) is { } product</code> : le motif <code>{ }</code> teste « non null » et range la valeur dans <code>product</code>.",
        "<code>Results.NotFound()</code> : un id inconnu donne un 404.",
        "Sortie : lancée avec <code>dotnet run</code>, l'API répond comme ceci. Les tests suivants vont vérifier la même chose, sans lancer de serveur."
      ]
    },
    {
      title: "Appeler l'API depuis un test",
      code: `// Fichier : OrderFlow.Tests/ProductsApiTests.cs
// dotnet add package Microsoft.AspNetCore.Mvc.Testing
// dotnet add reference ../OrderFlow.Api
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using OrderFlow.Domain;

namespace OrderFlow.Tests;

public class ProductsApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetProducts_ReturnsOkWithProducts()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.Equal(2, products!.Count);
    }

    [Fact]
    public async Task GetProduct_UnknownId_Returns404()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/products/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

// Lancer : dotnet test`,
      output: `Réussi!  - échec :     0, réussite :     2, ignorée(s) :     0, total :     2, durée : 579 ms - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>IClassFixture&lt;WebApplicationFactory&lt;Program&gt;&gt;</code> : xUnit crée une seule factory pour la classe, et la passe au constructeur principal (<code>factory</code>).",
        "<code>factory.CreateClient()</code> : démarre l'API en mémoire (la première fois) et renvoie un <code>HttpClient</code> branché dessus. L'URL de base est déjà réglée.",
        "<code>await client.GetAsync(\"/api/products\")</code> : une vraie requête HTTP traverse tout le pipeline : routing, DI, sérialisation JSON.",
        "<code>Assert.Equal(HttpStatusCode.OK, response.StatusCode);</code> : on vérifie d'abord le code HTTP.",
        "<code>ReadFromJsonAsync&lt;List&lt;Product&gt;&gt;()</code> : on relit le JSON en objets C#, comme le ferait un client.",
        "Sortie : les deux tests passent. La durée est plus longue que pour les tests unitaires car l'API entière démarre."
      ],
      explain: "Si quelqu'un renomme la route en /api/product, ce test passe au rouge alors que tous les tests unitaires restent verts."
    },
    {
      title: "Remplacer le dépôt par une doublure",
      code: `// Fichier : OrderFlow.Tests/FakeRepoApiTests.cs
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using OrderFlow.Domain;

namespace OrderFlow.Tests;

public class FakeRepoApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetProduct_UsesReplacedRepository()
    {
        var fakeRepo = Substitute.For<IProductRepository>();
        fakeRepo.GetByIdAsync(5).Returns(new Product { Id = 5, Name = "Écran", Price = 199m });

        var client = factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
                services.AddSingleton(fakeRepo)))
            .CreateClient();

        var product = await client.GetFromJsonAsync<Product>("/api/products/5");

        Assert.Equal("Écran", product!.Name);
    }
}

// Lancer : dotnet test`,
      output: `Réussi!  - échec :     0, réussite :     1, ignorée(s) :     0, total :     1, durée : 1 s - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>Substitute.For&lt;IProductRepository&gt;()</code> : la même doublure NSubstitute que dans un test unitaire.",
        "<code>fakeRepo.GetByIdAsync(5).Returns(…)</code> : le produit 5 n'existe pas dans le dépôt en mémoire. Il n'existe que dans la doublure.",
        "<code>factory.WithWebHostBuilder(…)</code> : crée une variante de l'API pour ce test, sans toucher la factory partagée.",
        "<code>builder.ConfigureTestServices(services =&gt; services.AddSingleton(fakeRepo))</code> : enregistre la doublure <em>après</em> <code>Program.cs</code>. La DI utilise le dernier enregistrement.",
        "<code>client.GetFromJsonAsync&lt;Product&gt;(\"/api/products/5\")</code> : lève une exception si le statut n'est pas un succès, puis lit le JSON.",
        "Sortie : le test passe, ce qui prouve que l'endpoint a bien utilisé la doublure et non le dépôt en mémoire."
      ],
      explain: "On contrôle exactement les données vues par l'API, tout en testant le vrai routing et la vraie sérialisation."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire un produit",
      prompt: `<p>Dans <code>ProductsApiTests</code>, écris un test qui appelle <code>/api/products/1</code> et vérifie que le nom est <code>"Clavier"</code> et le prix <code>49.90m</code>.</p>`,
      hint: `<p><code>GetFromJsonAsync&lt;Product&gt;</code> fait la requête et lit le JSON en une ligne.</p>`,
      solution: `[Fact]
public async Task GetProduct_1_ReturnsKeyboard()
{
    var client = factory.CreateClient();

    var product = await client.GetFromJsonAsync<Product>("/api/products/1");

    Assert.Equal("Clavier", product!.Name);
    Assert.Equal(49.90m, product.Price);
}`
    },
    {
      level: "moyen",
      title: "Simuler un produit disparu",
      prompt: `<p>Écris un test qui remplace le dépôt par une doublure renvoyant <code>null</code> pour n'importe quel id, puis vérifie que <code>/api/products/1</code> renvoie <code>404</code> (alors que le produit 1 existe dans le dépôt en mémoire).</p>`,
      hint: `<p><code>fakeRepo.GetByIdAsync(Arg.Any&lt;int&gt;()).Returns((Product?)null);</code> puis <code>WithWebHostBuilder</code> et <code>ConfigureTestServices</code> comme dans l'exemple 3.</p>`,
      solution: `[Fact]
public async Task GetProduct_RepoReturnsNull_Returns404()
{
    var fakeRepo = Substitute.For<IProductRepository>();
    fakeRepo.GetByIdAsync(Arg.Any<int>()).Returns((Product?)null);
    var client = factory.WithWebHostBuilder(b =>
        b.ConfigureTestServices(s => s.AddSingleton(fakeRepo))).CreateClient();

    var response = await client.GetAsync("/api/products/1");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}`
    },
    {
      level: "difficile",
      title: "Un endpoint protégé",
      prompt: `<p>Ajoute à l'API l'authentification JWT (<code>AddAuthentication().AddJwtBearer()</code>, <code>AddAuthorization()</code> et les deux middlewares) et un endpoint <code>GET /api/orders</code> marqué <code>.RequireAuthorization()</code>. Écris un test d'intégration qui vérifie qu'un appel sans jeton reçoit <code>401</code>.</p>`,
      hint: `<p>N'oublie pas <code>dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer</code> dans le projet API. Le test n'a besoin d'aucun jeton : il vérifie justement le refus.</p>`,
      solution: `// Fichier : OrderFlow.Api/Program.cs (extraits)
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/orders", () => new[] { 1, 2 }).RequireAuthorization();

// Fichier : OrderFlow.Tests/ProductsApiTests.cs
[Fact]
public async Task GetOrders_WithoutToken_Returns401()
{
    var client = factory.CreateClient();

    var response = await client.GetAsync("/api/orders");

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>factory.CreateClient()</code> ?`,
      options: ["Il démarre l'API en mémoire et renvoie un HttpClient branché dessus", "Il lance <code>dotnet run</code> sur le port 5080", "Il crée un client Angular de test"],
      answer: 0,
      why: `<code>WebApplicationFactory</code> exécute ton <code>Program.cs</code> sur un serveur de test en mémoire. Aucun port réseau n'est ouvert, et le client est déjà configuré pour l'appeler.`
    },
    {
      q: `Quel problème un test d'intégration détecte-t-il, qu'un test unitaire de <code>OrderService</code> ne verrait pas ?`,
      options: ["Une erreur de calcul dans le total", "Une route mal écrite ou un service oublié dans la DI", "Une faute dans un commentaire"],
      answer: 1,
      why: `Le test unitaire appelle la classe directement : il ignore le routing, la DI et la sérialisation. Le test d'intégration passe par tout le pipeline HTTP.`
    },
    {
      q: `À quoi sert <code>IClassFixture&lt;WebApplicationFactory&lt;Program&gt;&gt;</code> ?`,
      options: ["À démarrer une nouvelle API pour chaque test", "À partager une seule factory entre tous les tests de la classe", "À exécuter les tests dans un ordre précis"],
      answer: 1,
      why: `Démarrer l'API a un coût. Le fixture crée la factory une fois et la donne au constructeur de chaque instance de test.`
    },
    {
      q: `Pourquoi la doublure enregistrée dans <code>ConfigureTestServices</code> remplace-t-elle le dépôt de <code>Program.cs</code> ?`,
      options: ["Parce que NSubstitute supprime l'ancien enregistrement", "Parce que la DI utilise le dernier enregistrement d'un même service, et ConfigureTestServices passe après Program.cs", "Parce que les singletons sont ignorés en test"],
      answer: 1,
      why: `Les deux enregistrements existent, mais quand on demande un <code>IProductRepository</code>, la DI fournit le dernier ajouté. <code>ConfigureTestServices</code> s'exécute après la configuration de l'application.`
    }
  ],
  project: `<p><strong>OrderFlow : l'API sous surveillance.</strong> Ajoute <code>Microsoft.AspNetCore.Mvc.Testing</code> à <code>OrderFlow.Tests</code> et une référence vers <code>OrderFlow.Api</code>. Écris une classe <code>ProductsApiTests</code> avec <code>IClassFixture&lt;WebApplicationFactory&lt;Program&gt;&gt;</code> et au moins quatre tests : liste des produits (200), produit inconnu (404), <code>GET /api/orders</code> sans jeton (401), et un test où tu remplaces <code>IProductRepository</code> (ou ton <code>OrderFlowDbContext</code>) par une doublure avec <code>ConfigureTestServices</code>. À la fin, <code>dotnet test</code> lance d'un coup tes tests unitaires et d'intégration : ta pyramide est en place.</p>`,
  resources: [
    { label: "Tests d'intégration dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/test/integration-tests" },
    { label: "Tester les Minimal APIs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/test-min-api" }
  ]
});
