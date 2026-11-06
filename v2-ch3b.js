window.COURSE = window.COURSE || [];

// ===================== 3.9 Héritage =====================
window.COURSE.push({
  key: "l-inheritance",
  title: "Héritage",
  summary: "Tu sauras créer une classe qui hérite d'une autre, appeler le constructeur de la classe de base et comprendre ce qui est transmis.",
  objectives: [
    "Reconnaître une relation « est un » entre deux classes",
    "Écrire une classe dérivée avec la syntaxe <code>: Base</code>",
    "Appeler le constructeur parent avec <code>base(...)</code>",
    "Savoir que toute classe hérite de <code>object</code>"
  ],
  analogy: `<p>Dans une bibliothèque, un livre est un document. Un magazine aussi est un document. Les deux ont un titre, une cote, une date d'entrée dans le fonds. Mais un livre a un auteur, et un magazine a un numéro. Plutôt que de répéter « titre » dans chaque fiche, on décrit une fois ce qu'est un document, puis on dit : « un livre, c'est un document, avec en plus un auteur ». C'est exactement ça, l'héritage.</p>`,
  lesson: `<h3>La relation « est un »</h3>
<p>L'<strong>héritage</strong> permet à une classe de récupérer les membres (champs, propriétés, méthodes) d'une autre classe. La classe d'origine s'appelle la <strong>classe de base</strong> (ou classe parente). La nouvelle s'appelle la <strong>classe dérivée</strong> (ou classe enfant).</p>
<p>Le test à faire avant d'hériter est simple : peux-tu dire « un X <em>est un</em> Y » sans que ça sonne faux ? « Un livre est un document » : oui. « Un membre est un document » : non. Si la phrase ne tient pas, l'héritage n'est pas le bon outil.</p>

<h3>La syntaxe <code>: Base</code></h3>
<p>En C#, on écrit le nom de la classe de base après deux-points :</p>
<pre class="diagram">class Document { ... }        // classe de base
class Book : Document { ... } // Book hérite de Document</pre>
<p>Tout ce qui est <code>public</code> ou <code>protected</code> dans <code>Document</code> devient utilisable dans <code>Book</code>. Si <code>Document</code> a une propriété <code>Title</code>, alors un objet <code>Book</code> a aussi un <code>Title</code>, sans que tu l'écrives une deuxième fois.</p>
<p>Ce qui n'est pas transmis : les membres <code>private</code> (ils existent dans l'objet, mais la classe dérivée ne peut pas y toucher) et les constructeurs (chaque classe a les siens).</p>

<h3><code>protected</code> en pratique</h3>
<p>Tu as vu <code>protected</code> dans la leçon sur les modificateurs d'accès. C'est ici qu'il prend tout son sens : un membre <code>protected</code> est invisible depuis l'extérieur, mais visible dans les classes dérivées. C'est utile pour une donnée que les enfants doivent lire, sans l'exposer à tout le programme.</p>
<table>
<tr><th>Modificateur</th><th>Dans la classe</th><th>Dans une classe dérivée</th><th>Ailleurs</th></tr>
<tr><td><code>public</code></td><td>oui</td><td>oui</td><td>oui</td></tr>
<tr><td><code>protected</code></td><td>oui</td><td>oui</td><td>non</td></tr>
<tr><td><code>private</code></td><td>oui</td><td>non</td><td>non</td></tr>
</table>

<h3>Le constructeur de base et <code>base(...)</code></h3>
<p>Si <code>Document</code> a un constructeur qui demande un titre, <code>Book</code> doit lui fournir ce titre. On le fait avec <code>: base(...)</code> placé après la signature du constructeur de <code>Book</code> :</p>
<pre class="diagram">public Book(string title, string author)
    : base(title)   // appelle Document(title)
{
    Author = author;
}</pre>
<p>L'ordre d'exécution est toujours le même : d'abord le constructeur de la base, ensuite celui de la classe dérivée. Logique : on construit les fondations avant les étages.</p>
<div class="flow"><span>new Book(...)</span><span>Constructeur Document</span><span>Constructeur Book</span><span>Objet prêt</span></div>
<p>Avec un primary constructor, la même idée s'écrit sur une ligne : <code>class Book(string title, string author) : Document(title)</code>. Tu verras les deux formes dans la suite.</p>

<h3>Un seul parent, et tout le monde descend de <code>object</code></h3>
<p>En C#, une classe ne peut hériter que d'<strong>une seule</strong> classe. <code>class Comic : Book, Magazine</code> provoque une erreur. Pour combiner plusieurs capacités, on utilisera les interfaces (leçon 3.13). En revanche, une chaîne peut être longue : <code>Comic</code> hérite de <code>Book</code>, qui hérite de <code>Document</code>.</p>
<pre class="diagram">              object
                |
             Document
            /   |    \\
        Book Magazine Dvd
          |
        Comic</pre>
<p>Tout en haut, il y a <code>object</code> (alias de <code>System.Object</code>). Si tu n'indiques aucune base, ta classe hérite implicitement de <code>object</code>. C'est pour ça que n'importe quel objet possède <code>ToString()</code>, <code>Equals()</code> et <code>GetType()</code>. Par défaut, <code>ToString()</code> renvoie le nom du type.</p>

<h3>Et en TypeScript ?</h3>
<div class="compare"><div><h4>TypeScript</h4><p><code>class Book extends Document</code> puis <code>super(title)</code> en première ligne du constructeur.</p></div><div><h4>C#</h4><p><code>class Book : Document</code> puis <code>: base(title)</code> après la signature du constructeur, avant les accolades.</p></div></div>
<div class="tip">Si la classe de base n'a pas de constructeur sans paramètre, oublier <code>: base(...)</code> provoque une erreur de compilation. Le compilateur ne devine pas quel titre passer.</div>
<div class="note">N'hérite pas juste pour récupérer du code. Hérite quand la relation « est un » est vraie et le restera. Un arbre d'héritage de deux ou trois niveaux suffit presque toujours.</div>`,
  examples: [
    {
      title: "Un livre est un document",
      code: `Book book = new Book("Dune", "Frank Herbert");
Console.WriteLine(book.Title);
Console.WriteLine(book.Author);
book.Display();

class Document
{
    public string Title { get; }

    public Document(string title)
    {
        Title = title;
    }

    public void Display()
    {
        Console.WriteLine($"Document : {Title}");
    }
}

class Book : Document
{
    public string Author { get; }

    public Book(string title, string author) : base(title)
    {
        Author = author;
    }
}`,
      output: `Dune
Frank Herbert
Document : Dune`,
      steps: [
        `<code>class Document</code> : la classe de base, avec une propriété <code>Title</code> et une méthode <code>Display()</code>.`,
        `<code>class Book : Document</code> : <code>Book</code> hérite de tout ce qui est public dans <code>Document</code>.`,
        `<code>: base(title)</code> : avant d'exécuter son propre corps, le constructeur de <code>Book</code> passe le titre au constructeur de <code>Document</code>.`,
        `<code>Console.WriteLine(book.Title);</code> : <code>Title</code> n'est pas écrit dans <code>Book</code>, il vient de <code>Document</code>.`,
        `<code>book.Display();</code> : même chose pour la méthode, héritée telle quelle.`
      ],
      explain: "Book n'a écrit que ce qui lui est propre (Author) ; le reste vient de Document."
    },
    {
      title: "L'ordre des constructeurs et ToString() hérité d'object",
      code: `Magazine magazine = new Magazine("Géo", 512);
Console.WriteLine(magazine.ToString());

class Document
{
    public string Title { get; }

    public Document(string title)
    {
        Console.WriteLine("1. Constructeur de Document");
        Title = title;
    }
}

class Magazine : Document
{
    public int Issue { get; }

    public Magazine(string title, int issue) : base(title)
    {
        Console.WriteLine("2. Constructeur de Magazine");
        Issue = issue;
    }
}`,
      output: `1. Constructeur de Document
2. Constructeur de Magazine
Magazine`,
      steps: [
        `<code>new Magazine("Géo", 512)</code> : on demande un magazine.`,
        `<code>: base(title)</code> : le constructeur de <code>Document</code> s'exécute en premier et affiche « 1. ».`,
        `<code>Console.WriteLine("2. Constructeur de Magazine");</code> : ensuite seulement, le corps du constructeur de <code>Magazine</code>.`,
        `<code>magazine.ToString()</code> : ni <code>Magazine</code> ni <code>Document</code> ne définissent <code>ToString()</code>. La version vient d'<code>object</code> et renvoie le nom du type.`
      ],
      explain: "La base est toujours construite avant la classe dérivée."
    },
    {
      title: "Un membre protected partagé avec les enfants",
      code: `Book book = new Book("Dune", 3);
Console.WriteLine(book.Summary());
// Console.WriteLine(book.Copies); // erreur : Copies est protected

class Document
{
    public string Title { get; }
    protected int Copies { get; }

    public Document(string title, int copies)
    {
        Title = title;
        Copies = copies;
    }
}

class Book : Document
{
    public Book(string title, int copies) : base(title, copies) { }

    public string Summary()
    {
        // Copies est accessible ici car Book hérite de Document
        return $"{Title} : {Copies} exemplaire(s)";
    }
}`,
      output: `Dune : 3 exemplaire(s)`,
      steps: [
        `<code>protected int Copies { get; }</code> : visible dans <code>Document</code> et ses classes dérivées, pas ailleurs.`,
        `<code>: base(title, copies) { }</code> : le constructeur de <code>Book</code> n'a rien d'autre à faire que transmettre ; son corps est vide.`,
        `<code>return $"{Title} : {Copies} exemplaire(s)";</code> : depuis <code>Book</code>, on lit <code>Copies</code> sans problème.`,
        `<code>// Console.WriteLine(book.Copies);</code> : depuis le programme principal, ce serait une erreur de compilation.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter un DVD",
      prompt: `<p>Reprends la classe <code>Document</code> du premier exemple. Crée une classe <code>Dvd</code> qui hérite de <code>Document</code> et ajoute une propriété <code>Minutes</code> (durée en minutes). Crée un DVD « Matrix » de 136 minutes, affiche son titre, sa durée, puis appelle <code>Display()</code>.</p>`,
      hint: `<p>Le constructeur de <code>Dvd</code> prend <code>title</code> et <code>minutes</code>, et transmet <code>title</code> avec <code>: base(title)</code>.</p>`,
      solution: `Dvd dvd = new Dvd("Matrix", 136);
Console.WriteLine(dvd.Title);
Console.WriteLine(dvd.Minutes);
dvd.Display();

class Document
{
    public string Title { get; }
    public Document(string title) { Title = title; }
    public void Display() => Console.WriteLine($"Document : {Title}");
}

class Dvd : Document
{
    public int Minutes { get; }

    public Dvd(string title, int minutes) : base(title)
    {
        Minutes = minutes;
    }
}`
    },
    {
      level: "moyen",
      title: "Une base qui fait le travail commun",
      prompt: `<p>Ajoute à <code>Document</code> une propriété <code>Year</code> (année de parution) passée au constructeur, et une méthode <code>Age(int currentYear)</code> qui renvoie l'âge du document. Crée <code>Book</code> (avec <code>Author</code>) et <code>Magazine</code> (avec <code>Issue</code>). Affiche l'âge d'un livre de 1965 et d'un magazine de 2020 en 2026.</p>`,
      hint: `<p><code>Age</code> s'écrit une seule fois, dans <code>Document</code>. Les deux constructeurs dérivés appellent <code>base(title, year)</code>.</p>`,
      solution: `Book book = new Book("Dune", 1965, "Frank Herbert");
Magazine magazine = new Magazine("Géo", 2020, 500);
Console.WriteLine($"{book.Title} : {book.Age(2026)} ans");
Console.WriteLine($"{magazine.Title} : {magazine.Age(2026)} ans");

class Document
{
    public string Title { get; }
    public int Year { get; }

    public Document(string title, int year)
    {
        Title = title;
        Year = year;
    }

    public int Age(int currentYear) => currentYear - Year;
}

class Book : Document
{
    public string Author { get; }
    public Book(string title, int year, string author) : base(title, year) { Author = author; }
}

class Magazine : Document
{
    public int Issue { get; }
    public Magazine(string title, int year, int issue) : base(title, year) { Issue = issue; }
}`
    },
    {
      level: "difficile",
      title: "Trois niveaux d'héritage",
      prompt: `<p>Crée la chaîne <code>Document</code> → <code>Book</code> → <code>Comic</code> (bande dessinée, avec une propriété <code>Illustrator</code>). Chaque constructeur affiche un message. <strong>Avant d'exécuter</strong>, écris sur papier l'ordre d'affichage attendu pour <code>new Comic("Astérix", "Goscinny", "Uderzo")</code>, puis vérifie.</p>`,
      hint: `<p><code>Comic</code> appelle <code>base(title, author)</code>, c'est-à-dire le constructeur de <code>Book</code>, qui lui-même appelle <code>base(title)</code>. La base la plus haute s'exécute en premier.</p>`,
      solution: `Comic comic = new Comic("Astérix", "Goscinny", "Uderzo");
Console.WriteLine($"{comic.Title}, {comic.Author} et {comic.Illustrator}");

class Document
{
    public string Title { get; }
    public Document(string title)
    {
        Console.WriteLine("Document");
        Title = title;
    }
}

class Book : Document
{
    public string Author { get; }
    public Book(string title, string author) : base(title)
    {
        Console.WriteLine("Book");
        Author = author;
    }
}

class Comic : Book
{
    public string Illustrator { get; }
    public Comic(string title, string author, string illustrator) : base(title, author)
    {
        Console.WriteLine("Comic");
        Illustrator = illustrator;
    }
}
// Affiche : Document, Book, Comic, puis Astérix, Goscinny et Uderzo`
    }
  ],
  quiz: [
    {
      q: `Quelle relation justifie un héritage ?`,
      options: [`« X utilise Y »`, `« X est un Y »`, `« X contient un Y »`],
      answer: 1,
      why: `L'héritage exprime « est un » : un livre est un document. « Utilise » ou « contient » décrivent une autre relation (la composition, vue en 3.15).`
    },
    {
      q: `Dans <code>class Book : Document</code>, quel constructeur s'exécute en premier lors d'un <code>new Book(...)</code> ?`,
      options: [`Celui de <code>Document</code>`, `Celui de <code>Book</code>`, `L'ordre n'est pas garanti`],
      answer: 0,
      why: `La base est toujours construite d'abord, puis la classe dérivée. L'ordre est garanti par le langage.`
    },
    {
      q: `Que se passe-t-il avec <code>class Comic : Book, Magazine</code> ?`,
      options: [`<code>Comic</code> hérite des deux classes`, `Seule la première base est prise en compte`, `Erreur de compilation : une seule classe de base est permise`],
      answer: 2,
      why: `C# n'autorise qu'une classe de base. Pour combiner plusieurs capacités, on utilise des interfaces.`
    },
    {
      q: `Pourquoi n'importe quel objet possède-t-il une méthode <code>ToString()</code> ?`,
      options: [`Parce que toutes les classes héritent de <code>object</code>`, `Parce que le compilateur l'ajoute uniquement aux classes publiques`, `Parce que <code>Console.WriteLine</code> la crée au moment de l'appel`],
      answer: 0,
      why: `Toute classe hérite, directement ou non, de <code>System.Object</code>, qui définit <code>ToString()</code>, <code>Equals()</code> et <code>GetType()</code>.`
    }
  ],
  project: `<p>Dans ton projet Bibliothèque, crée une classe de base <code>Document</code> avec <code>Title</code> et <code>Year</code>. Fais hériter <code>Book</code> (avec <code>Author</code>) et crée <code>Magazine</code> (avec <code>Issue</code>). Dans <code>Program.cs</code>, crée un livre et un magazine et affiche leurs titres.</p>`,
  resources: [
    { label: "Héritage en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/object-oriented/inheritance" }
  ]
});

// ===================== 3.10 virtual et override =====================
window.COURSE.push({
  key: "l-virtual-override",
  title: "virtual et override",
  summary: "Tu sauras permettre à une classe dérivée de redéfinir une méthode de sa base, et réutiliser la version d'origine avec base.",
  objectives: [
    "Marquer une méthode <code>virtual</code> pour autoriser sa redéfinition",
    "Redéfinir une méthode avec <code>override</code>",
    "Réutiliser le comportement parent avec <code>base.Method()</code>",
    "Redéfinir <code>ToString()</code>"
  ],
  analogy: `<p>La bibliothèque a une règle générale : « 1 € par jour de retard ». Mais le règlement prévoit des exceptions : pour les livres, on ajoute des frais de dossier ; pour les magazines, la pénalité est plafonnée. La règle générale existe, et chaque type de document peut la remplacer par la sienne. Dans le code, la règle générale est <code>virtual</code>, l'exception est <code>override</code>.</p>`,
  lesson: `<h3>Hériter, c'est bien. Adapter, c'est mieux.</h3>
<p>Avec l'héritage simple, <code>Book</code> récupère les méthodes de <code>Document</code> telles quelles. Mais souvent, une classe dérivée doit faire la même chose <em>autrement</em>. Exemple : décrire un document. Un livre veut afficher son auteur, un magazine son numéro.</p>
<p>Redéfinir une méthode, c'est fournir dans la classe dérivée une nouvelle version d'une méthode héritée. En C#, ça demande deux mots-clés, un de chaque côté.</p>

<h3><code>virtual</code> dans la base, <code>override</code> dans la dérivée</h3>
<p>Par défaut, une méthode C# n'est <strong>pas</strong> redéfinissable. La classe de base doit donner sa permission avec <code>virtual</code>. La classe dérivée doit ensuite dire explicitement qu'elle redéfinit, avec <code>override</code>.</p>
<pre class="diagram">class Document
{
    public virtual string Describe() =&gt; ...;  // permis
}
class Book : Document
{
    public override string Describe() =&gt; ...; // redéfini
}</pre>
<p>La signature doit être identique : même nom, mêmes paramètres, même type de retour, même accessibilité. Si tu écris <code>override</code> sur une méthode qui n'est pas <code>virtual</code>, le compilateur refuse.</p>
<div class="compare"><div><h4>TypeScript</h4><p>Toutes les méthodes sont redéfinissables. Le mot-clé <code>override</code> existe mais il est optionnel (sauf avec l'option <code>noImplicitOverride</code>).</p></div><div><h4>C#</h4><p>Rien n'est redéfinissable sans <code>virtual</code>, et <code>override</code> est obligatoire. Les deux côtés doivent être d'accord.</p></div></div>

<h3>Réutiliser la version parente avec <code>base</code></h3>
<p>Souvent, on ne veut pas tout remplacer, juste ajouter quelque chose. Dans une méthode <code>override</code>, <code>base.Describe()</code> appelle la version de la classe de base. Tu as déjà vu <code>base(...)</code> pour les constructeurs : c'est le même mot, utilisé ici pour une méthode.</p>
<pre class="diagram">public override int CalculateLateFee(int days)
{
    return base.CalculateLateFee(days) + 2;
}</pre>

<h3>Quelle méthode est appelée ?</h3>
<p>Le point clé : avec une méthode <code>virtual</code>, c'est le <strong>vrai type de l'objet</strong> qui décide, pas le type de la variable. Une variable de type <code>Document</code> peut contenir un <code>Book</code> (un livre est un document). Si tu appelles <code>Describe()</code> dessus, c'est la version de <code>Book</code> qui s'exécute.</p>
<table>
<tr><th>Variable</th><th>Objet réel</th><th><code>Describe()</code> appelée</th></tr>
<tr><td><code>Document</code></td><td><code>Document</code></td><td>version de <code>Document</code></td></tr>
<tr><td><code>Book</code></td><td><code>Book</code></td><td>version de <code>Book</code></td></tr>
<tr><td><code>Document</code></td><td><code>Book</code></td><td>version de <code>Book</code></td></tr>
<tr><td><code>Document</code></td><td><code>Magazine</code> (sans override)</td><td>version de <code>Document</code></td></tr>
</table>
<div class="flow"><span>doc.Describe()</span><span>Quel est l'objet réel ?</span><span>Book</span><span>Book.Describe()</span></div>
<p>On approfondira ce mécanisme dans la leçon sur le polymorphisme.</p>

<h3>Redéfinir <code>ToString()</code></h3>
<p><code>ToString()</code> est déclarée <code>virtual</code> dans <code>object</code>. Tu peux donc la redéfinir dans n'importe quelle classe : <code>public override string ToString() =&gt; ...</code>. C'est très pratique, car <code>Console.WriteLine(objet)</code> et l'interpolation <code>$"{objet}"</code> appellent <code>ToString()</code> automatiquement.</p>

<h3>Ce qui ne peut pas être <code>virtual</code></h3>
<ul>
<li>Une méthode <code>static</code> : elle appartient à la classe, pas à un objet, donc il n'y a pas d'« objet réel » pour choisir la version.</li>
<li>Une méthode <code>private</code> : la classe dérivée ne la voit pas, elle ne peut donc pas la redéfinir.</li>
</ul>
<p>Les propriétés, elles, peuvent être <code>virtual</code> et redéfinies exactement comme les méthodes.</p>
<div class="tip">Oublier <code>virtual</code> dans la base est l'erreur la plus fréquente. Le message du compilateur dit alors qu'on ne peut pas redéfinir un membre « non marqué virtual, abstract ou override ».</div>
<div class="note">Ne rends pas tout <code>virtual</code> « au cas où ». Chaque méthode virtuelle est une promesse : la classe dérivée peut changer ce comportement. Ouvre seulement ce qui doit vraiment varier.</div>`,
  examples: [
    {
      title: "Describe() redéfinie dans Book",
      code: `Document guide = new Document("Guide du lecteur");
Book book = new Book("Dune", "Frank Herbert");
Console.WriteLine(guide.Describe());
Console.WriteLine(book.Describe());

class Document(string title)
{
    public string Title { get; } = title;

    public virtual string Describe()
    {
        return $"Document : {Title}";
    }
}

class Book(string title, string author) : Document(title)
{
    public string Author { get; } = author;

    public override string Describe()
    {
        return $"Livre : {Title} de {Author}";
    }
}`,
      output: `Document : Guide du lecteur
Livre : Dune de Frank Herbert`,
      steps: [
        `<code>public virtual string Describe()</code> : <code>Document</code> autorise ses enfants à redéfinir cette méthode.`,
        `<code>class Book(string title, string author) : Document(title)</code> : primary constructor ; <code>title</code> est transmis au constructeur de <code>Document</code>.`,
        `<code>public override string Describe()</code> : <code>Book</code> fournit sa propre version.`,
        `<code>guide.Describe()</code> : l'objet est un <code>Document</code>, on obtient la version de base.`,
        `<code>book.Describe()</code> : l'objet est un <code>Book</code>, on obtient la version redéfinie.`
      ]
    },
    {
      title: "Une pénalité différente par type de document",
      code: `Document guide = new Document("Guide");
Book book = new Book("Dune");
Magazine magazine = new Magazine("Géo");
Console.WriteLine($"{guide.Title} : {guide.CalculateLateFee(4)} €");
Console.WriteLine($"{book.Title} : {book.CalculateLateFee(4)} €");
Console.WriteLine($"{magazine.Title} : {magazine.CalculateLateFee(4)} €");

class Document(string title)
{
    public string Title { get; } = title;

    // règle générale : 1 € par jour de retard
    public virtual int CalculateLateFee(int daysLate) => daysLate * 1;
}

class Book(string title) : Document(title)
{
    // règle générale + 2 € de frais de dossier
    public override int CalculateLateFee(int daysLate) => base.CalculateLateFee(daysLate) + 2;
}

class Magazine(string title) : Document(title)
{
    // 1 € par jour, mais jamais plus de 3 €
    public override int CalculateLateFee(int daysLate) => Math.Min(daysLate, 3);
}`,
      output: `Guide : 4 €
Dune : 6 €
Géo : 3 €`,
      steps: [
        `<code>public virtual int CalculateLateFee(int daysLate) =&gt; daysLate * 1;</code> : la règle générale. La flèche <code>=&gt;</code> remplace un corps <code>{ return ...; }</code> d'une seule ligne.`,
        `<code>base.CalculateLateFee(daysLate) + 2</code> : <code>Book</code> réutilise la règle générale (4 €) et ajoute 2 €, soit 6 €.`,
        `<code>Math.Min(daysLate, 3)</code> : <code>Magazine</code> remplace complètement la règle ; 4 jours donnent le plafond de 3 €.`,
        `<code>guide.CalculateLateFee(4)</code> : un simple <code>Document</code> applique la règle générale, 4 €.`
      ],
      explain: "Une seule méthode, trois comportements : chaque type applique sa règle."
    },
    {
      title: "Variable de type Document, objet Book, et ToString()",
      code: `Document doc = new Book("Dune", "Frank Herbert");
Console.WriteLine(doc.Describe());
Console.WriteLine(doc);

class Document(string title)
{
    public string Title { get; } = title;
    public virtual string Describe() => $"Document : {Title}";
}

class Book(string title, string author) : Document(title)
{
    public string Author { get; } = author;

    public override string Describe() => $"Livre : {Title} de {Author}";

    public override string ToString() => $"[Book] {Title}";
}`,
      output: `Livre : Dune de Frank Herbert
[Book] Dune`,
      steps: [
        `<code>Document doc = new Book(...)</code> : la variable est de type <code>Document</code>, mais l'objet créé est un <code>Book</code>.`,
        `<code>doc.Describe()</code> : <code>Describe</code> est virtuelle, donc c'est l'objet réel (<code>Book</code>) qui décide.`,
        `<code>public override string ToString()</code> : on redéfinit la méthode héritée d'<code>object</code>.`,
        `<code>Console.WriteLine(doc);</code> : <code>WriteLine</code> appelle <code>ToString()</code>, et c'est encore la version de <code>Book</code>.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Redéfinir ToString()",
      prompt: `<p>Crée une classe <code>Member</code> avec <code>FirstName</code> et <code>LastName</code>. Redéfinis <code>ToString()</code> pour qu'elle renvoie « Prénom NOM » (nom en majuscules). Affiche un membre avec <code>Console.WriteLine(member)</code>.</p>`,
      hint: `<p><code>ToString()</code> est déjà <code>virtual</code> dans <code>object</code> : il suffit d'écrire <code>public override string ToString()</code>. <code>ToUpper()</code> met une chaîne en majuscules.</p>`,
      solution: `Member member = new Member("Alice", "Martin");
Console.WriteLine(member); // Alice MARTIN

class Member(string firstName, string lastName)
{
    public string FirstName { get; } = firstName;
    public string LastName { get; } = lastName;

    public override string ToString() => $"{FirstName} {LastName.ToUpper()}";
}`
    },
    {
      level: "moyen",
      title: "Le DVD a sa propre pénalité",
      prompt: `<p>Reprends l'exemple des pénalités. Ajoute une classe <code>Dvd</code> dont la pénalité vaut 3 € par jour. Ajoute aussi une méthode virtuelle <code>Describe()</code> dans <code>Document</code>, redéfinie dans <code>Dvd</code> pour afficher « DVD : titre ». Teste avec 2 jours de retard.</p>`,
      hint: `<p>Deux <code>override</code> dans <code>Dvd</code> : un pour <code>CalculateLateFee</code>, un pour <code>Describe</code>. N'oublie pas <code>virtual</code> sur les deux méthodes de la base.</p>`,
      solution: `Dvd dvd = new Dvd("Matrix");
Console.WriteLine(dvd.Describe());
Console.WriteLine($"{dvd.CalculateLateFee(2)} €"); // 6 €

class Document(string title)
{
    public string Title { get; } = title;
    public virtual int CalculateLateFee(int daysLate) => daysLate * 1;
    public virtual string Describe() => $"Document : {Title}";
}

class Dvd(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate * 3;
    public override string Describe() => $"DVD : {Title}";
}`
    },
    {
      level: "difficile",
      title: "Compléter plutôt que remplacer",
      prompt: `<p>Dans <code>Document</code>, <code>Describe()</code> renvoie « titre (année) ». Dans <code>Book</code>, redéfinis-la pour renvoyer « titre (année), de auteur » <strong>sans réécrire</strong> le titre ni l'année : réutilise la version de base. Fais de même dans <code>Magazine</code> pour ajouter « n°numéro ».</p>`,
      hint: `<p><code>base.Describe()</code> renvoie déjà « titre (année) ». Il reste à concaténer la fin.</p>`,
      solution: `Document[] docs = [new Book("Dune", 1965, "Frank Herbert"), new Magazine("Géo", 2024, 540)];
foreach (Document doc in docs)
{
    Console.WriteLine(doc.Describe());
}

class Document(string title, int year)
{
    public string Title { get; } = title;
    public int Year { get; } = year;
    public virtual string Describe() => $"{Title} ({Year})";
}

class Book(string title, int year, string author) : Document(title, year)
{
    public override string Describe() => $"{base.Describe()}, de {author}";
}

class Magazine(string title, int year, int issue) : Document(title, year)
{
    public override string Describe() => $"{base.Describe()}, n°{issue}";
}
// Dune (1965), de Frank Herbert
// Géo (2024), n°540`
    }
  ],
  quiz: [
    {
      q: `Que faut-il pour qu'une classe dérivée puisse redéfinir <code>Describe()</code> ?`,
      options: [`Seulement <code>override</code> dans la dérivée`, `<code>virtual</code> dans la base et <code>override</code> dans la dérivée`, `Seulement <code>virtual</code> dans la base`],
      answer: 1,
      why: `Les deux côtés doivent être d'accord : la base autorise avec <code>virtual</code>, la dérivée redéfinit explicitement avec <code>override</code>. Sans <code>override</code>, la méthode ne redéfinit pas, elle masque (et le compilateur avertit).`
    },
    {
      q: `<code>Document doc = new Book(...);</code> puis <code>doc.Describe();</code> avec <code>Describe</code> virtuelle et redéfinie dans <code>Book</code>. Quelle version s'exécute ?`,
      options: [`Celle de <code>Document</code>, car la variable est de type <code>Document</code>`, `Les deux, l'une après l'autre`, `Celle de <code>Book</code>, car l'objet réel est un <code>Book</code>`],
      answer: 2,
      why: `Pour une méthode virtuelle, c'est le type réel de l'objet qui décide, pas le type déclaré de la variable.`
    },
    {
      q: `À quoi sert <code>base.CalculateLateFee(days)</code> dans un <code>override</code> ?`,
      options: [`À appeler la version de la classe de base`, `À appeler le constructeur de la base`, `À empêcher les autres classes de redéfinir la méthode`],
      answer: 0,
      why: `<code>base.Méthode()</code> exécute la version parente, ce qui permet de la compléter plutôt que de tout réécrire. Le constructeur parent s'appelle avec <code>: base(...)</code>, une autre syntaxe.`
    },
    {
      q: `Laquelle de ces méthodes peut être <code>virtual</code> ?`,
      options: [`<code>private void Check()</code>`, `<code>public static int Count()</code>`, `<code>public string Describe()</code>`],
      answer: 2,
      why: `Une méthode <code>static</code> n'est liée à aucun objet, et une méthode <code>private</code> est invisible pour les classes dérivées : aucune des deux ne peut être virtuelle.`
    }
  ],
  project: `<p>Dans le projet Bibliothèque, ajoute à <code>Document</code> une méthode <code>public virtual string Describe()</code> qui renvoie le titre et l'année. Redéfinis-la dans <code>Book</code> (ajoute l'auteur) et dans <code>Magazine</code> (ajoute le numéro) en réutilisant <code>base.Describe()</code>.</p>`,
  resources: [
    { label: "Mot-clé virtual (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/virtual" },
    { label: "Mot-clé override (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/override" }
  ]
});

// ===================== 3.11 Classes et méthodes abstraites =====================
window.COURSE.push({
  key: "l-abstract",
  title: "Classes et méthodes abstraites",
  summary: "Tu sauras déclarer une classe qu'on ne peut pas instancier et imposer à ses classes dérivées d'implémenter certaines méthodes.",
  objectives: [
    "Déclarer une classe <code>abstract</code> et comprendre pourquoi on ne peut pas l'instancier",
    "Écrire une méthode abstraite sans corps",
    "Mélanger méthodes concrètes et abstraites dans une même classe",
    "Déclarer une propriété abstraite"
  ],
  analogy: `<p>Va au comptoir et demande « un document, s'il vous plaît ». Le bibliothécaire te regardera bizarrement : quel document ? Un livre, un magazine, un DVD ? « Un document » en général n'existe pas sur les étagères. C'est une catégorie, une idée qui regroupe des choses concrètes. En C#, une telle catégorie s'appelle une classe abstraite : elle décrit ce que tous les documents ont en commun, mais on ne peut fabriquer que des livres, des magazines ou des DVD.</p>`,
  lesson: `<h3>Une classe qu'on ne peut pas instancier</h3>
<p>Dans la leçon précédente, on pouvait écrire <code>new Document("Guide")</code>. Mais dans notre bibliothèque, un document « tout court » n'a pas de sens. On veut l'interdire. Le mot-clé <code>abstract</code> devant <code>class</code> fait exactement ça.</p>
<pre class="diagram">abstract class Document { ... }

new Document("Guide");  // erreur CS0144
new Book("Dune");       // ok, Book est concret</pre>
<p>Une classe <strong>abstraite</strong> sert uniquement de base. Une classe qui n'est pas abstraite s'appelle une classe <strong>concrète</strong> : on peut l'instancier. On peut quand même déclarer une variable de type <code>Document</code> : elle contiendra un <code>Book</code> ou un <code>Magazine</code>.</p>

<h3>La méthode abstraite : un trou à combler</h3>
<p>Dans la leçon 3.10, <code>CalculateLateFee</code> avait une règle générale dans <code>Document</code>. Mais si cette règle n'a pas de sens, on ne veut pas l'inventer. On déclare alors une <strong>méthode abstraite</strong> : une signature sans corps, terminée par un point-virgule.</p>
<pre class="diagram">public abstract int CalculateLateFee(int daysLate);</pre>
<p>Ce que ça veut dire : « tout document sait calculer sa pénalité, mais chaque type doit dire comment ». Chaque classe dérivée concrète <strong>doit</strong> fournir une version avec <code>override</code>. Si tu oublies, le compilateur refuse avec l'erreur CS0534 (« n'implémente pas le membre abstrait hérité »). C'est une protection : impossible d'oublier un cas.</p>
<div class="compare"><div><h4>Méthode virtual</h4><p>A un corps par défaut. La dérivée <em>peut</em> la redéfinir.</p></div><div><h4>Méthode abstract</h4><p>N'a pas de corps. La dérivée <em>doit</em> la redéfinir.</p></div></div>
<p>Une méthode abstraite est implicitement virtuelle : on n'écrit pas <code>virtual</code> en plus. Et elle ne peut exister que dans une classe abstraite.</p>

<h3>Mélanger concret et abstrait</h3>
<p>Une classe abstraite n'est pas vide. Elle peut contenir des propriétés, des champs, des constructeurs et des méthodes normales. C'est même son grand intérêt : mettre en commun le code partagé, et ne laisser « en blanc » que ce qui varie.</p>
<p>Exemple typique : une méthode concrète <code>Receipt()</code> dans <code>Document</code> qui fabrique un reçu en appelant <code>CalculateLateFee()</code>. Le reçu est le même pour tous, seul le calcul change. La base appelle une méthode qu'elle ne sait pas implémenter elle-même, et c'est la dérivée qui répond.</p>
<div class="flow"><span>doc.Receipt(3)</span><span>Document.Receipt</span><span>CalculateLateFee(3)</span><span>version de Dvd</span></div>

<h3>Propriétés abstraites et constructeur protected</h3>
<p>Une propriété aussi peut être abstraite : <code>public abstract string Kind { get; }</code>. Chaque dérivée donne sa valeur, par exemple <code>public override string Kind =&gt; "DVD";</code>.</p>
<p>Le constructeur d'une classe abstraite ne peut être appelé que par les classes dérivées (via <code>base(...)</code>). On le déclare donc souvent <code>protected</code> : ça documente l'intention, et un constructeur <code>public</code> n'apporterait rien.</p>
<table>
<tr><th>Élément</th><th>Dans une classe abstraite</th></tr>
<tr><td>Méthode avec corps</td><td>oui, partagée par toutes les dérivées</td></tr>
<tr><td>Méthode <code>abstract</code></td><td>oui, sans corps, à implémenter</td></tr>
<tr><td>Propriété <code>abstract</code></td><td>oui</td></tr>
<tr><td>Constructeur</td><td>oui, souvent <code>protected</code></td></tr>
<tr><td><code>new</code> direct</td><td>non</td></tr>
</table>

<h3>Et en TypeScript ?</h3>
<p>Bonne nouvelle : c'est presque identique. TypeScript a aussi <code>abstract class</code> et <code>abstract</code> sur les méthodes. La différence est surtout la syntaxe d'héritage (<code>extends</code> contre <code>:</code>) et le fait qu'en C# l'implémentation doit porter <code>override</code>.</p>
<div class="tip">Une classe dérivée qui n'implémente pas toutes les méthodes abstraites doit elle-même être déclarée <code>abstract</code>. Sinon, erreur CS0534.</div>`,
  examples: [
    {
      title: "Document devient abstrait",
      code: `// Document doc = new Document("Guide"); // erreur CS0144 : classe abstraite
Document book = new Book("Dune");
Document magazine = new Magazine("Géo");
Console.WriteLine($"{book.Title} : {book.CalculateLateFee(5)} €");
Console.WriteLine($"{magazine.Title} : {magazine.CalculateLateFee(5)} €");

abstract class Document(string title)
{
    public string Title { get; } = title;

    // pas de corps : chaque type de document décide
    public abstract int CalculateLateFee(int daysLate);
}

class Book(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate * 2;
}

class Magazine(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate;
}`,
      output: `Dune : 10 €
Géo : 5 €`,
      steps: [
        `<code>abstract class Document(string title)</code> : on ne pourra plus écrire <code>new Document(...)</code>.`,
        `<code>public abstract int CalculateLateFee(int daysLate);</code> : une signature sans corps. Note le point-virgule final.`,
        `<code>public override int CalculateLateFee(...) =&gt; daysLate * 2;</code> : <code>Book</code> est obligé de fournir son calcul.`,
        `<code>Document book = new Book("Dune");</code> : une variable de type abstrait est autorisée, tant que l'objet est concret.`,
        `<code>book.CalculateLateFee(5)</code> : 5 jours × 2 € = 10 € pour le livre, 5 € pour le magazine.`
      ]
    },
    {
      title: "Concret + abstrait, propriété abstraite et constructeur protected",
      code: `Document dvd = new Dvd("Matrix");
Console.WriteLine(dvd.Kind);
Console.WriteLine(dvd.Receipt(3));

abstract class Document
{
    public string Title { get; }

    protected Document(string title)
    {
        Title = title;
    }

    public abstract string Kind { get; }

    public abstract int CalculateLateFee(int daysLate);

    // méthode concrète, partagée par toutes les dérivées
    public string Receipt(int daysLate)
    {
        return $"{Kind} « {Title} » : {CalculateLateFee(daysLate)} € de pénalité";
    }
}

class Dvd : Document
{
    public Dvd(string title) : base(title) { }
    public override string Kind => "DVD";
    public override int CalculateLateFee(int daysLate) => daysLate * 3;
}`,
      output: `DVD
DVD « Matrix » : 9 € de pénalité`,
      steps: [
        `<code>protected Document(string title)</code> : seul un enfant peut appeler ce constructeur, via <code>base(title)</code>.`,
        `<code>public abstract string Kind { get; }</code> : une propriété abstraite en lecture seule.`,
        `<code>public string Receipt(int daysLate)</code> : méthode normale, écrite une seule fois, qui utilise <code>Kind</code> et <code>CalculateLateFee</code> sans savoir comment ils sont calculés.`,
        `<code>public override string Kind =&gt; "DVD";</code> : <code>Dvd</code> donne sa valeur.`,
        `<code>dvd.Receipt(3)</code> : <code>Receipt</code> vient de <code>Document</code>, mais <code>Kind</code> et <code>CalculateLateFee</code> (3 × 3 = 9) viennent de <code>Dvd</code>.`
      ],
      explain: "La base fournit la structure, les dérivées remplissent les trous."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Provoquer l'erreur",
      prompt: `<p>Reprends le premier exemple et ajoute une classe <code>Dvd : Document</code> <strong>sans</strong> implémenter <code>CalculateLateFee</code>. Compile et lis l'erreur. Corrige ensuite en ajoutant un <code>override</code> qui renvoie 3 € par jour.</p>`,
      hint: `<p>L'erreur attendue est CS0534. Elle cite le nom du membre abstrait manquant.</p>`,
      solution: `Document dvd = new Dvd("Matrix");
Console.WriteLine($"{dvd.Title} : {dvd.CalculateLateFee(2)} €"); // Matrix : 6 €

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract int CalculateLateFee(int daysLate);
}

// sans l'override ci-dessous : erreur CS0534
class Dvd(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate * 3;
}`
    },
    {
      level: "moyen",
      title: "Une propriété abstraite MaxLoanDays",
      prompt: `<p>Ajoute à <code>Document</code> une propriété abstraite <code>MaxLoanDays</code> (durée maximale d'emprunt). Un livre : 21 jours, un magazine : 7 jours. Ajoute une méthode concrète <code>IsLate(int daysBorrowed)</code> qui renvoie <code>true</code> si la durée dépasse <code>MaxLoanDays</code>. Teste avec 10 jours.</p>`,
      hint: `<p><code>public abstract int MaxLoanDays { get; }</code> dans la base, <code>public override int MaxLoanDays =&gt; 21;</code> dans <code>Book</code>.</p>`,
      solution: `Document book = new Book("Dune");
Document magazine = new Magazine("Géo");
Console.WriteLine(book.IsLate(10));     // False
Console.WriteLine(magazine.IsLate(10)); // True

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract int MaxLoanDays { get; }
    public bool IsLate(int daysBorrowed) => daysBorrowed > MaxLoanDays;
}

class Book(string title) : Document(title)
{
    public override int MaxLoanDays => 21;
}

class Magazine(string title) : Document(title)
{
    public override int MaxLoanDays => 7;
}`
    },
    {
      level: "difficile",
      title: "Un reçu complet",
      prompt: `<p>Combine les deux : <code>Document</code> abstraite avec <code>MaxLoanDays</code> et <code>CalculateLateFee</code> abstraites, et une méthode concrète <code>Receipt(int daysBorrowed)</code> qui calcule le nombre de jours de retard (0 si pas en retard) et renvoie « titre : X jour(s) de retard, Y € ». Implémente <code>Book</code> (21 jours, 1 €/jour) et <code>Magazine</code> (7 jours, 2 €/jour).</p>`,
      hint: `<p>Jours de retard : <code>Math.Max(0, daysBorrowed - MaxLoanDays)</code>. Passe ce nombre à <code>CalculateLateFee</code>.</p>`,
      solution: `Document[] docs = [new Book("Dune"), new Magazine("Géo")];
foreach (Document doc in docs)
{
    Console.WriteLine(doc.Receipt(25));
}
// Dune : 4 jour(s) de retard, 4 €
// Géo : 18 jour(s) de retard, 36 €

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract int MaxLoanDays { get; }
    public abstract int CalculateLateFee(int daysLate);

    public string Receipt(int daysBorrowed)
    {
        int daysLate = Math.Max(0, daysBorrowed - MaxLoanDays);
        return $"{Title} : {daysLate} jour(s) de retard, {CalculateLateFee(daysLate)} €";
    }
}

class Book(string title) : Document(title)
{
    public override int MaxLoanDays => 21;
    public override int CalculateLateFee(int daysLate) => daysLate;
}

class Magazine(string title) : Document(title)
{
    public override int MaxLoanDays => 7;
    public override int CalculateLateFee(int daysLate) => daysLate * 2;
}`
    }
  ],
  quiz: [
    {
      q: `<code>abstract class Document</code>. Que donne <code>new Document("Guide")</code> ?`,
      options: [`Une erreur de compilation`, `Un document vide sans titre`, `Une exception à l'exécution`],
      answer: 0,
      why: `Une classe abstraite ne peut pas être instanciée ; le compilateur le détecte (CS0144) avant même l'exécution.`
    },
    {
      q: `Quelle est la bonne déclaration d'une méthode abstraite ?`,
      options: [`<code>public abstract int Fee(int d) { return 0; }</code>`, `<code>public virtual abstract int Fee(int d);</code>`, `<code>public abstract int Fee(int d);</code>`],
      answer: 2,
      why: `Une méthode abstraite n'a pas de corps et se termine par un point-virgule. Elle est déjà implicitement virtuelle : écrire <code>virtual</code> en plus est une erreur.`
    },
    {
      q: `Une classe abstraite peut-elle contenir des méthodes avec un corps ?`,
      options: [`Non, seulement des méthodes abstraites`, `Oui, et c'est même un de ses intérêts`, `Oui, mais seulement si elles sont <code>static</code>`],
      answer: 1,
      why: `Une classe abstraite mélange librement code concret (partagé) et membres abstraits (à fournir par les dérivées).`
    }
  ],
  project: `<p>Rends <code>Document</code> abstraite dans ton projet Bibliothèque et ajoute <code>public abstract decimal CalculateLateFee(int daysLate);</code>. Implémente-la dans <code>Book</code> et <code>Magazine</code> avec des tarifs différents. Vérifie que <code>new Document(...)</code> ne compile plus.</p>`,
  resources: [
    { label: "Mot-clé abstract (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/abstract" }
  ]
});

// ===================== 3.12 sealed, new, partial et required =====================
window.COURSE.push({
  key: "l-sealed-new-partial",
  title: "sealed, new, partial et required",
  summary: "Tu sauras bloquer l'héritage, éviter le piège du masquage avec new, répartir une classe sur plusieurs fichiers et rendre une propriété obligatoire.",
  objectives: [
    "Empêcher l'héritage avec <code>sealed</code>",
    "Distinguer <code>new</code> (masquage) et <code>override</code>",
    "Savoir à quoi sert <code>partial</code>",
    "Rendre une propriété obligatoire avec <code>required</code> et <code>init</code>"
  ],
  analogy: `<p>Quatre petits outils de la boîte à outils. <code>sealed</code>, c'est un tampon « version finale, ne pas modifier » sur un formulaire. <code>new</code>, c'est coller une étiquette par-dessus une ancienne sans l'enlever : selon d'où on regarde, on voit l'une ou l'autre. <code>partial</code>, c'est un dossier rangé dans deux classeurs. <code>required</code>, c'est la case avec un astérisque rouge sur le formulaire d'inscription : impossible de valider sans la remplir.</p>`,
  lesson: `<h3><code>sealed</code> : fin de la lignée</h3>
<p>Une classe <code>sealed</code> (scellée) ne peut plus avoir d'enfants. <code>sealed class Book : Document</code> veut dire : « <code>Book</code> hérite de <code>Document</code>, mais personne n'héritera de <code>Book</code> ». Toute tentative donne l'erreur CS0509.</p>
<p>Pourquoi ? Parce qu'une classe conçue pour être héritée demande du soin (quoi rendre <code>virtual</code>, quoi rendre <code>protected</code>). Si tu n'as pas pensé ta classe pour ça, scelle-la. Beaucoup d'équipes scellent par défaut toutes les classes « feuilles ».</p>
<p><code>sealed</code> se place aussi sur un <code>override</code> : <code>public sealed override string Describe()</code>. La méthode est redéfinie ici, et les classes plus bas ne pourront plus la redéfinir.</p>

<h3><code>new</code> : masquer au lieu de redéfinir</h3>
<p>Que se passe-t-il si une classe dérivée déclare une méthode de même nom qu'une méthode <strong>non virtuelle</strong> de la base ? Elle la <strong>masque</strong>. Le compilateur émet un avertissement (CS0108), et le mot-clé <code>new</code> devant la méthode sert juste à dire « oui, je le fais exprès ».</p>
<p>La différence avec <code>override</code> se voit quand on utilise une variable du type de base :</p>
<table>
<tr><th>Appel</th><th>avec <code>override</code></th><th>avec <code>new</code></th></tr>
<tr><td><code>Book b = new Book(); b.M()</code></td><td>version Book</td><td>version Book</td></tr>
<tr><td><code>Document d = new Book(); d.M()</code></td><td>version Book</td><td><strong>version Document</strong></td></tr>
</table>
<div class="compare"><div><h4>override</h4><p>L'objet réel décide. Le même objet se comporte pareil, quelle que soit la variable.</p></div><div><h4>new</h4><p>Le type de la variable décide. Le même objet change de comportement selon la façon dont on le regarde.</p></div></div>
<p>C'est pour ça que <code>new</code> est presque toujours une erreur : on croit avoir redéfini un comportement, mais dès qu'on parcourt une liste de <code>Document</code>, c'est l'ancienne version qui s'exécute. Si tu vois l'avertissement CS0108, la bonne réponse est en général de rendre la méthode de base <code>virtual</code> et d'utiliser <code>override</code>, ou de choisir un autre nom.</p>

<h3><code>partial</code> : une classe en plusieurs morceaux</h3>
<p><code>partial class Book</code> permet d'écrire la même classe dans plusieurs fichiers. À la compilation, les morceaux sont fusionnés en une seule classe. Chaque morceau doit porter <code>partial</code>.</p>
<p>Tu l'écriras rarement toi-même. Son vrai usage : le <strong>code généré</strong>. Un outil génère un morceau (par exemple un fichier <code>.g.cs</code>), toi tu écris l'autre, et l'outil peut régénérer son fichier sans écraser ton code. Tu le croiseras avec les générateurs de source, WinForms ou certaines bibliothèques.</p>

<h3><code>required</code> et <code>init</code></h3>
<p>Tu connais l'initialiseur d'objet : <code>new Member { FirstName = "Alice" }</code>. Problème : rien n'oblige à remplir chaque propriété. Depuis C# 11, <code>required</code> rend une propriété obligatoire dans l'initialiseur. Si on l'oublie, erreur CS9035 à la compilation.</p>
<p>On l'associe souvent à <code>init</code> à la place de <code>set</code> : la propriété peut être affectée pendant la création (constructeur ou initialiseur), puis plus jamais. L'objet est rempli de façon sûre, puis figé.</p>
<pre class="diagram">public required string Email { get; init; }

new Member { FirstName = "Bob" }   // CS9035 : Email manque
member.Email = "x@y.fr";           // erreur : init seulement</pre>

<h3>Fiche mémo des mots-clés de classe</h3>
<table>
<tr><th>Mot-clé</th><th>Où</th><th>À quoi il sert</th></tr>
<tr><td><code>abstract</code></td><td>classe, méthode, propriété</td><td>classe non instanciable ; membre sans corps à implémenter</td></tr>
<tr><td><code>virtual</code></td><td>méthode, propriété (base)</td><td>autorise la redéfinition</td></tr>
<tr><td><code>override</code></td><td>méthode, propriété (dérivée)</td><td>redéfinit un membre virtual ou abstract</td></tr>
<tr><td><code>sealed</code></td><td>classe, override</td><td>interdit d'hériter / de redéfinir plus loin</td></tr>
<tr><td><code>new</code></td><td>membre (dérivée)</td><td>masque un membre de la base (à éviter)</td></tr>
<tr><td><code>static</code></td><td>classe, membre</td><td>appartient à la classe, pas aux objets</td></tr>
<tr><td><code>partial</code></td><td>classe, méthode</td><td>définition répartie sur plusieurs fichiers</td></tr>
<tr><td><code>required</code></td><td>propriété, champ</td><td>doit être rempli à la création</td></tr>
</table>
<div class="tip">Ne confonds pas <code>new</code> devant une méthode (masquage) et <code>new Book()</code> (création d'un objet). Même mot, deux sens sans rapport.</div>
<div class="note">Bonne habitude pro : <code>sealed</code> sur les classes qui ne sont pas pensées pour l'héritage, et <code>required</code> + <code>init</code> pour les objets de données. Ton code dit clairement ce qui est permis.</div>`,
  examples: [
    {
      title: "new contre override : la démonstration",
      code: `Book book = new Book();
Document asDocument = book; // même objet, vu comme un Document

Console.WriteLine(book.Describe());
Console.WriteLine(asDocument.Describe());
Console.WriteLine(book.Label());
Console.WriteLine(asDocument.Label());

class Document
{
    public virtual string Describe() => "Document.Describe";
    public string Label() => "Document.Label";
}

class Book : Document
{
    public override string Describe() => "Book.Describe";
    public new string Label() => "Book.Label";
}`,
      output: `Book.Describe
Book.Describe
Book.Label
Document.Label`,
      steps: [
        `<code>Document asDocument = book;</code> : un seul objet <code>Book</code>, deux variables de types différents.`,
        `<code>public override string Describe()</code> : redéfinition. Les deux appels donnent <code>Book.Describe</code>, car l'objet réel décide.`,
        `<code>public new string Label()</code> : masquage d'une méthode non virtuelle.`,
        `<code>book.Label()</code> : la variable est de type <code>Book</code>, on voit la nouvelle version.`,
        `<code>asDocument.Label()</code> : la variable est de type <code>Document</code>, on voit l'ancienne version. Même objet, résultat différent : c'est le piège.`
      ],
      explain: "Avec new, le comportement dépend de la variable ; avec override, de l'objet. C'est presque toujours override que tu veux."
    },
    {
      title: "Un membre sealed avec des propriétés required",
      code: `Member member = new Member { FirstName = "Alice", Email = "alice@mail.fr" };
Console.WriteLine($"{member.FirstName} ({member.Email}), {member.MaxLoans} emprunts max");

// Member bob = new Member { FirstName = "Bob" };  // erreur CS9035 : Email est required
// member.Email = "autre@mail.fr";                // erreur : Email est init
// class VipMember : Member { }                   // erreur CS0509 : Member est sealed

sealed class Member
{
    public required string FirstName { get; init; }
    public required string Email { get; init; }
    public int MaxLoans { get; init; } = 3;
}`,
      output: `Alice (alice@mail.fr), 3 emprunts max`,
      steps: [
        `<code>sealed class Member</code> : aucune classe ne pourra hériter de <code>Member</code>.`,
        `<code>public required string FirstName { get; init; }</code> : obligatoire à la création, puis non modifiable.`,
        `<code>public int MaxLoans { get; init; } = 3;</code> : pas <code>required</code>, elle a une valeur par défaut.`,
        `<code>new Member { FirstName = ..., Email = ... }</code> : l'initialiseur remplit les deux propriétés obligatoires, la compilation passe.`,
        `<code>// Member bob = ...</code> : les lignes commentées montrent les trois erreurs que le compilateur t'éviterait.`
      ]
    },
    {
      title: "Une classe partial en deux morceaux",
      code: `Book book = new Book { Title = "Dune", Author = "Frank Herbert" };
Console.WriteLine(book.Describe());

// Morceau 1 (dans un vrai projet : Book.cs)
partial class Book
{
    public required string Title { get; init; }
    public required string Author { get; init; }
}

// Morceau 2 (dans un vrai projet : Book.Display.cs)
partial class Book
{
    public string Describe() => $"{Title} de {Author}";
}`,
      output: `Dune de Frank Herbert`,
      steps: [
        `<code>partial class Book</code> (morceau 1) : déclare les propriétés.`,
        `<code>partial class Book</code> (morceau 2) : déclare la méthode. Les deux morceaux portent <code>partial</code>.`,
        `<code>public string Describe() =&gt; $"{Title} de {Author}";</code> : le morceau 2 utilise les propriétés du morceau 1, comme si tout était écrit au même endroit.`,
        `<code>new Book { ... }</code> : pour le reste du programme, il n'y a qu'une seule classe <code>Book</code>.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Sceller les feuilles",
      prompt: `<p>Écris une classe abstraite <code>Document</code> avec <code>Title</code>, puis <code>Book</code> et <code>Magazine</code> scellées qui en héritent. Ajoute en commentaire une classe <code>Comic : Book</code> et vérifie (en décommentant) qu'elle provoque CS0509.</p>`,
      hint: `<p><code>sealed class Book(string title) : Document(title) { }</code></p>`,
      solution: `Document[] docs = [new Book("Dune"), new Magazine("Géo")];
foreach (Document doc in docs)
{
    Console.WriteLine(doc.Title);
}

abstract class Document(string title)
{
    public string Title { get; } = title;
}

sealed class Book(string title) : Document(title) { }
sealed class Magazine(string title) : Document(title) { }

// class Comic : Book { } // erreur CS0509 : Book est sealed`
    },
    {
      level: "moyen",
      title: "Corriger un new",
      prompt: `<p>Ce code affiche « Document » pour un livre parcouru dans un tableau de <code>Document</code>. Corrige-le pour qu'il affiche « Livre ».</p><pre class="diagram">class Document { public string Kind() =&gt; "Document"; }
class Book : Document { public new string Kind() =&gt; "Livre"; }

Document[] docs = [new Book()];
Console.WriteLine(docs[0].Kind());</pre>`,
      hint: `<p>Il faut remplacer le masquage par une vraie redéfinition : un mot-clé dans la base, un autre dans la dérivée.</p>`,
      solution: `Document[] docs = [new Book()];
Console.WriteLine(docs[0].Kind()); // Livre

class Document
{
    public virtual string Kind() => "Document";
}

class Book : Document
{
    public override string Kind() => "Livre";
}`
    },
    {
      level: "difficile",
      title: "Un emprunt bien construit",
      prompt: `<p>Crée une classe scellée <code>Loan</code> (emprunt) avec <code>BookTitle</code> et <code>MemberName</code> obligatoires (<code>required</code>, <code>init</code>), et <code>Days</code> en <code>init</code> avec 21 par défaut. Ajoute une méthode <code>Describe()</code>. Crée un emprunt de 14 jours et un emprunt par défaut, et affiche-les.</p>`,
      hint: `<p>Pour l'emprunt de 14 jours, ajoute <code>Days = 14</code> dans l'initialiseur. Pour l'autre, ne mets rien.</p>`,
      solution: `Loan shortLoan = new Loan { BookTitle = "Dune", MemberName = "Alice", Days = 14 };
Loan defaultLoan = new Loan { BookTitle = "Fondation", MemberName = "Bob" };
Console.WriteLine(shortLoan.Describe());   // Dune prêté à Alice pour 14 jours
Console.WriteLine(defaultLoan.Describe()); // Fondation prêté à Bob pour 21 jours

sealed class Loan
{
    public required string BookTitle { get; init; }
    public required string MemberName { get; init; }
    public int Days { get; init; } = 21;

    public string Describe() => $"{BookTitle} prêté à {MemberName} pour {Days} jours";
}`
    }
  ],
  quiz: [
    {
      q: `<code>Document d = new Book();</code>. <code>Label()</code> est déclarée normalement dans <code>Document</code> et avec <code>new</code> dans <code>Book</code>. Que fait <code>d.Label()</code> ?`,
      options: [`Exécute la version de <code>Document</code>`, `Exécute la version de <code>Book</code>`, `Provoque une erreur de compilation`],
      answer: 0,
      why: `Avec <code>new</code>, c'est le type de la variable qui décide. La variable est un <code>Document</code>, donc la version de <code>Document</code> s'exécute. C'est justement le piège du masquage.`
    },
    {
      q: `Que garantit <code>sealed class Member</code> ?`,
      options: [`Ses propriétés ne peuvent plus changer`, `On ne peut pas créer d'objet <code>Member</code>`, `Aucune classe ne peut hériter de <code>Member</code>`],
      answer: 2,
      why: `<code>sealed</code> interdit l'héritage. Ça ne rend pas l'objet immuable (c'est le rôle de <code>init</code> ou <code>readonly</code>), et ça n'empêche pas l'instanciation (c'est <code>abstract</code>).`
    },
    {
      q: `Avec <code>public required string Email { get; init; }</code>, que donne <code>new Member { FirstName = "Bob" }</code> ?`,
      options: [`<code>Email</code> vaut <code>null</code>`, `Une erreur de compilation`, `Une exception à l'exécution`],
      answer: 1,
      why: `<code>required</code> est vérifié par le compilateur : oublier <code>Email</code> dans l'initialiseur donne l'erreur CS9035, avant même de lancer le programme.`
    },
    {
      q: `Quel est l'usage principal de <code>partial</code> ?`,
      options: [`Rendre une classe à moitié abstraite`, `Séparer le code généré par un outil du code écrit à la main`, `Partager une classe entre deux projets différents`],
      answer: 1,
      why: `Les morceaux d'une classe <code>partial</code> doivent être dans le même projet ; ils sont fusionnés à la compilation. L'usage typique est de laisser un outil régénérer son morceau sans toucher au tien.`
    }
  ],
  project: `<p>Scelle <code>Book</code> et <code>Magazine</code> dans ton projet Bibliothèque. Transforme ensuite <code>Member</code> pour que <code>FirstName</code>, <code>LastName</code> et <code>Email</code> soient <code>required</code> avec <code>init</code>, et crée tes membres avec un initialiseur d'objet.</p>`,
  resources: [
    { label: "Mot-clé required (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/required" },
    { label: "Mot-clé sealed (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/sealed" }
  ]
});

// ===================== 3.13 Interfaces =====================
window.COURSE.push({
  key: "l-interfaces",
  title: "Interfaces",
  summary: "Tu sauras déclarer une interface, l'implémenter dans une ou plusieurs classes et manipuler des objets à travers elle.",
  objectives: [
    "Déclarer une interface comme un contrat",
    "Implémenter une ou plusieurs interfaces dans une classe",
    "Utiliser une variable de type interface",
    "Reconnaître des interfaces du framework comme <code>IComparable&lt;T&gt;</code>"
  ],
  analogy: `<p>Une prise électrique est un contrat. Elle dit : « si ton appareil a une fiche de cette forme, je lui donne du courant ». La prise se moque de savoir si c'est une lampe, un grille-pain ou un chargeur. Et un appareil peut respecter plusieurs normes à la fois : une prise électrique et un port USB. Une interface C#, c'est cette norme : une liste de ce que l'objet sait faire, sans dire comment.</p>`,
  lesson: `<h3>Un contrat, pas une implémentation</h3>
<p>Une <strong>interface</strong> décrit des capacités : des méthodes et des propriétés, sans leur code. Une classe qui <strong>implémente</strong> l'interface s'engage à fournir tous ces membres. Si elle en oublie un, le compilateur refuse (erreur CS0535).</p>
<p>Dans la bibliothèque, certains objets peuvent être empruntés : livres, DVD, peut-être des liseuses plus tard. Mais pas les magazines du jour, consultables sur place. « Empruntable » n'est pas une catégorie de documents, c'est une <em>capacité</em>. C'est le cas typique d'une interface.</p>

<h3>Déclarer et implémenter</h3>
<pre class="diagram">interface IBorrowable
{
    bool IsAvailable { get; }
    void Borrow(string memberName);
    void Return();
}</pre>
<p>Pas de <code>public</code> devant les membres : dans une interface, ils sont publics par défaut. Pas de corps non plus, juste un point-virgule. Pour implémenter, on utilise la même syntaxe deux-points que pour l'héritage : <code>class Book : IBorrowable { ... }</code>.</p>
<p>Dans la classe, les membres implémentés doivent être <code>public</code>, et on n'écrit <strong>pas</strong> <code>override</code> : on remplit un contrat, on ne redéfinit pas une méthode héritée.</p>

<h3>Plusieurs interfaces à la fois</h3>
<p>Une classe n'a qu'une classe de base, mais elle peut implémenter autant d'interfaces qu'elle veut. On les sépare par des virgules, la classe de base en premier :</p>
<pre class="diagram">class Dvd : Document, IBorrowable, IRateable

   Document     IBorrowable    IRateable
      |              :             :
      +--------------+-------------+
                     |
                    Dvd
  (trait plein = hérite, pointillés = implémente)</pre>

<h3>Le préfixe I et les variables de type interface</h3>
<p>Par convention, le nom d'une interface commence par un <code>I</code> majuscule : <code>IBorrowable</code>, <code>IComparable</code>, <code>IDisposable</code>. Le compilateur ne l'exige pas, mais tout le monde le fait. En un coup d'oeil, tu sais que c'est un contrat.</p>
<p>On ne peut pas faire <code>new IBorrowable()</code>, mais on peut déclarer une variable de ce type : <code>IBorrowable item = new Book("Dune");</code>. À travers cette variable, tu ne vois <strong>que</strong> les membres du contrat. C'est voulu : le code qui emprunte n'a pas besoin de savoir s'il manipule un livre ou un DVD.</p>
<div class="flow"><span>Code appelant</span><span>IBorrowable</span><span>Book ou Dvd</span></div>

<h3>Quelques interfaces du framework</h3>
<p>.NET en définit beaucoup. Deux que tu croiseras vite :</p>
<table>
<tr><th>Interface</th><th>Contrat</th><th>Utilisée par</th></tr>
<tr><td><code>IComparable&lt;T&gt;</code></td><td><code>int CompareTo(T? other)</code> : négatif, zéro ou positif</td><td><code>Array.Sort</code> et le tri en général</td></tr>
<tr><td><code>IDisposable</code></td><td><code>void Dispose()</code> : libérer une ressource (fichier, connexion)</td><td>l'instruction <code>using</code>, vue au chapitre 6</td></tr>
</table>
<p>En implémentant <code>IComparable&lt;Book&gt;</code>, ton livre devient triable par les méthodes de tri du framework, sans qu'elles connaissent ta classe. C'est la force des contrats.</p>
<p>Pour info : depuis C# 8, une interface peut fournir un corps par défaut à certains membres ; c'est un usage avancé, réservé à l'évolution de bibliothèques, que tu peux ignorer pour l'instant.</p>

<h3>Différence majeure avec TypeScript</h3>
<div class="compare"><div><h4>TypeScript : structurel</h4><p>Un objet qui a les bonnes propriétés et méthodes est compatible avec l'interface, même s'il ne la mentionne jamais. <code>implements</code> est facultatif.</p></div><div><h4>C# : nominal</h4><p>Une classe est compatible seulement si elle <strong>déclare</strong> l'interface (<code>class Book : IBorrowable</code>). Avoir les bonnes méthodes ne suffit pas.</p></div></div>
<p>Autre différence : en TypeScript, les interfaces disparaissent à la compilation. En C#, elles existent à l'exécution, et on peut tester <code>if (obj is IBorrowable)</code>.</p>
<div class="tip">Dans la liste après les deux-points, la classe de base vient toujours en premier, puis les interfaces. <code>class Dvd : IBorrowable, Document</code> est une erreur.</div>`,
  examples: [
    {
      title: "Déclarer et implémenter IBorrowable",
      code: `Book book = new Book("Dune");
Console.WriteLine(book.IsAvailable);
book.Borrow("Alice");
Console.WriteLine(book.IsAvailable);
book.Return();
Console.WriteLine(book.IsAvailable);

interface IBorrowable
{
    bool IsAvailable { get; }
    void Borrow(string memberName);
    void Return();
}

class Book(string title) : IBorrowable
{
    public string Title { get; } = title;
    public bool IsAvailable { get; private set; } = true;

    public void Borrow(string memberName)
    {
        IsAvailable = false;
        Console.WriteLine($"{Title} emprunté par {memberName}");
    }
    public void Return()
    {
        IsAvailable = true;
        Console.WriteLine($"{Title} rendu");
    }
}`,
      output: `True
Dune emprunté par Alice
False
Dune rendu
True`,
      steps: [
        `<code>interface IBorrowable</code> : trois membres, sans corps et sans <code>public</code>.`,
        `<code>class Book(string title) : IBorrowable</code> : <code>Book</code> s'engage à fournir les trois.`,
        `<code>public bool IsAvailable { get; private set; } = true;</code> : l'interface demande seulement un <code>get</code> ; la classe peut ajouter un <code>set</code> privé pour son usage.`,
        `<code>public void Borrow(string memberName)</code> : l'implémentation, publique, sans <code>override</code>.`,
        `<code>Console.WriteLine(book.IsAvailable);</code> : un <code>bool</code> s'affiche <code>True</code> ou <code>False</code>, avec une majuscule.`
      ]
    },
    {
      title: "Une classe de base et deux interfaces",
      code: `IBorrowable item = new Dvd("Matrix");
item.Borrow("Bob");
// item.Rate(5); // erreur : IBorrowable ne connaît pas Rate

IRateable rateable = new Dvd("Alien");
rateable.Rate(4);

interface IBorrowable
{
    void Borrow(string memberName);
}

interface IRateable
{
    void Rate(int stars);
}

abstract class Document(string title)
{
    public string Title { get; } = title;
}

sealed class Dvd(string title) : Document(title), IBorrowable, IRateable
{
    public void Borrow(string memberName) => Console.WriteLine($"{Title} emprunté par {memberName}");
    public void Rate(int stars) => Console.WriteLine($"{Title} noté {stars}/5");
}`,
      output: `Matrix emprunté par Bob
Alien noté 4/5`,
      steps: [
        `<code>sealed class Dvd(...) : Document(title), IBorrowable, IRateable</code> : une base d'abord, puis deux interfaces.`,
        `<code>IBorrowable item = new Dvd("Matrix");</code> : la variable ne voit que le contrat <code>IBorrowable</code>.`,
        `<code>// item.Rate(5);</code> : l'objet sait noter, mais la variable ne le montre pas ; le compilateur refuserait.`,
        `<code>IRateable rateable = new Dvd("Alien");</code> : vu à travers l'autre contrat, c'est <code>Rate</code> qui est accessible.`
      ],
      explain: "Le type de la variable détermine ce que tu peux appeler ; l'objet, lui, sait tout faire."
    },
    {
      title: "Rendre des livres triables avec IComparable<T>",
      code: `Book[] books = [new Book("Dune", 412), new Book("Le Petit Prince", 96), new Book("Fondation", 255)];
Array.Sort(books);

foreach (Book book in books)
{
    Console.WriteLine($"{book.Pages} pages : {book.Title}");
}

class Book(string title, int pages) : IComparable<Book>
{
    public string Title { get; } = title;
    public int Pages { get; } = pages;

    public int CompareTo(Book? other)
    {
        if (other is null) return 1;
        return Pages.CompareTo(other.Pages);
    }
}`,
      output: `96 pages : Le Petit Prince
255 pages : Fondation
412 pages : Dune`,
      steps: [
        `<code>class Book(...) : IComparable&lt;Book&gt;</code> : on promet de savoir se comparer à un autre <code>Book</code>.`,
        `<code>public int CompareTo(Book? other)</code> : le <code>?</code> signifie que <code>other</code> peut être <code>null</code> (détaillé au chapitre 4).`,
        `<code>return Pages.CompareTo(other.Pages);</code> : <code>int</code> sait déjà se comparer ; on délègue au nombre de pages.`,
        `<code>Array.Sort(books);</code> : <code>Array.Sort</code> ne connaît pas <code>Book</code>, mais il connaît le contrat <code>IComparable&lt;T&gt;</code>. Il trie du plus petit au plus grand.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une interface IDescribable",
      prompt: `<p>Déclare une interface <code>IDescribable</code> avec une méthode <code>string Describe()</code>. Implémente-la dans <code>Book</code> et dans <code>Member</code> (deux classes sans lien d'héritage). Affiche la description de chacun via une variable de type <code>IDescribable</code>.</p>`,
      hint: `<p><code>class Member(string name) : IDescribable</code>, puis une méthode <code>public string Describe()</code>.</p>`,
      solution: `IDescribable book = new Book("Dune");
IDescribable member = new Member("Alice");
Console.WriteLine(book.Describe());   // Livre : Dune
Console.WriteLine(member.Describe()); // Membre : Alice

interface IDescribable
{
    string Describe();
}

class Book(string title) : IDescribable
{
    public string Describe() => $"Livre : {title}";
}

class Member(string name) : IDescribable
{
    public string Describe() => $"Membre : {name}";
}`
    },
    {
      level: "moyen",
      title: "Empruntable seulement s'il est disponible",
      prompt: `<p>Reprends <code>IBorrowable</code> du premier exemple. Modifie <code>Borrow</code> pour qu'elle renvoie un <code>bool</code> : <code>true</code> si l'emprunt réussit, <code>false</code> si le livre est déjà emprunté. Teste deux emprunts successifs du même livre.</p>`,
      hint: `<p>Change la signature dans l'interface <strong>et</strong> dans la classe. Commence par <code>if (!IsAvailable) return false;</code>.</p>`,
      solution: `Book book = new Book("Dune");
Console.WriteLine(book.Borrow("Alice")); // True
Console.WriteLine(book.Borrow("Bob"));   // False

interface IBorrowable
{
    bool IsAvailable { get; }
    bool Borrow(string memberName);
    void Return();
}

class Book(string title) : IBorrowable
{
    public string Title { get; } = title;
    public bool IsAvailable { get; private set; } = true;

    public bool Borrow(string memberName)
    {
        if (!IsAvailable) return false;
        IsAvailable = false;
        return true;
    }

    public void Return() => IsAvailable = true;
}`
    },
    {
      level: "difficile",
      title: "Trier par titre",
      prompt: `<p>Implémente <code>IComparable&lt;Book&gt;</code> pour trier des livres par <strong>titre</strong> (ordre alphabétique). Trie un tableau de trois livres avec <code>Array.Sort</code> et affiche-les.</p>`,
      hint: `<p><code>string.Compare(Title, other.Title, StringComparison.Ordinal)</code> compare deux chaînes et renvoie un entier négatif, nul ou positif.</p>`,
      solution: `Book[] books = [new Book("Fondation"), new Book("Dune"), new Book("Hypérion")];
Array.Sort(books);
foreach (Book book in books)
{
    Console.WriteLine(book.Title);
}
// Dune, Fondation, Hypérion

class Book(string title) : IComparable<Book>
{
    public string Title { get; } = title;

    public int CompareTo(Book? other)
    {
        if (other is null) return 1;
        return string.Compare(Title, other.Title, StringComparison.Ordinal);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Combien d'interfaces une classe C# peut-elle implémenter ?`,
      options: [`Une seule, comme pour l'héritage`, `Autant qu'elle veut`, `Deux au maximum`],
      answer: 1,
      why: `L'héritage de classe est limité à une base, mais une classe peut implémenter un nombre quelconque d'interfaces, séparées par des virgules.`
    },
    {
      q: `Une classe a une méthode <code>public void Borrow(string m)</code> mais ne déclare pas <code>: IBorrowable</code>. Peut-on l'affecter à une variable <code>IBorrowable</code> ?`,
      options: [`Oui, comme en TypeScript, la forme suffit`, `Oui, mais avec un avertissement`, `Non, en C# il faut déclarer l'implémentation`],
      answer: 2,
      why: `Le typage des interfaces en C# est nominal : la classe doit déclarer l'interface. En TypeScript (structurel), la forme suffirait.`
    },
    {
      q: `Comment écrit-on l'implémentation de <code>Borrow</code> dans la classe ?`,
      options: [`<code>public void Borrow(string m) { ... }</code>`, `<code>public override void Borrow(string m) { ... }</code>`, `<code>void Borrow(string m) { ... }</code>, privée par défaut`],
      answer: 0,
      why: `On remplit un contrat, on ne redéfinit pas une méthode héritée : pas d'<code>override</code>. Et le membre doit être public, sinon le contrat n'est pas rempli.`
    }
  ],
  project: `<p>Crée dans ton projet Bibliothèque l'interface <code>IBorrowable</code> avec <code>IsAvailable</code>, <code>Borrow(Member member)</code> et <code>Return()</code>. Implémente-la dans <code>Book</code>, mais pas dans <code>Magazine</code> (les magazines se consultent sur place).</p>`,
  resources: [
    { label: "Interfaces en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/interfaces" }
  ]
});

// ===================== 3.14 Polymorphisme =====================
window.COURSE.push({
  key: "l-polymorphism",
  title: "Polymorphisme",
  summary: "Tu sauras traiter des objets de types différents de façon uniforme, et retrouver leur type précis avec is, as et le pattern matching.",
  objectives: [
    "Parcourir un tableau de <code>Document</code> contenant des types différents",
    "Profiter du polymorphisme via une classe de base ou une interface",
    "Tester un type avec <code>is</code>, <code>as</code> et <code>if (doc is Book book)</code>",
    "Choisir un comportement selon le type avec <code>switch</code>"
  ],
  analogy: `<p>Le soir, le bibliothécaire passe dans les rayons et dit à chaque objet : « présente-toi ». Le livre répond avec son auteur, le magazine avec son numéro, le DVD avec sa durée. Le bibliothécaire n'a pas trois discours différents : il pose une seule question, et chacun répond à sa manière. Polymorphisme veut dire « plusieurs formes » : un même appel, plusieurs comportements.</p>`,
  lesson: `<h3>Un même appel, des comportements différents</h3>
<p>Tu as déjà tous les ingrédients : l'héritage, les méthodes <code>virtual</code> ou <code>abstract</code> avec <code>override</code>, et les interfaces. Le <strong>polymorphisme</strong>, c'est le résultat quand on les combine : du code écrit pour le type général (<code>Document</code>) qui fonctionne avec tous les types précis (<code>Book</code>, <code>Magazine</code>, <code>Dvd</code>), sans les connaître.</p>
<p>Concrètement, on range des objets différents dans une même collection du type de base, et on boucle dessus :</p>
<pre class="diagram">Document[] catalog = [book, magazine, dvd];
foreach (Document doc in catalog)
    Console.WriteLine(doc.Describe());</pre>
<p>La boucle ne contient aucun <code>if</code>. Si demain tu ajoutes une classe <code>AudioBook</code>, cette boucle fonctionne sans modification. C'est tout l'intérêt.</p>

<h3>Résolu à l'exécution</h3>
<p>Le compilateur voit seulement <code>doc</code>, de type <code>Document</code>. Il vérifie que <code>Describe()</code> existe dans <code>Document</code>. Mais le choix de la version à exécuter se fait <strong>pendant l'exécution</strong>, en regardant l'objet réel. On parle de <em>liaison dynamique</em>.</p>
<div class="flow"><span>doc.Describe()</span><span>Compilation : existe dans Document ?</span><span>Exécution : objet réel = Magazine</span><span>Magazine.Describe()</span></div>
<pre class="diagram">  catalog (Document[])
  +-------+-------+-------+
  |   0   |   1   |   2   |
  +---|---+---|---+---|---+
      v       v       v
    Book  Magazine   Dvd     (objets réels)
      |       |       |
  Describe Describe Describe (3 versions)</pre>

<h3>Via une classe de base ou via une interface</h3>
<p>Le polymorphisme fonctionne aussi avec une interface. Une collection de <code>IBorrowable</code> peut contenir un livre et un DVD, même s'ils n'ont aucune classe de base commune. Chaque appel à <code>Borrow()</code> exécute la version de l'objet réel.</p>
<p>Pour la collection, tu peux utiliser un tableau (<code>Document[]</code>) ou, en aperçu, une <code>List&lt;Document&gt;</code>, qui peut grandir avec <code>Add()</code>. Les listes sont détaillées au chapitre 5.</p>

<h3>Retrouver le type précis : <code>is</code> et <code>as</code></h3>
<p>Parfois, tu as besoin d'un membre qui n'existe que dans la classe dérivée, par exemple <code>Pages</code> pour un livre. Il faut alors tester le type.</p>
<table>
<tr><th>Syntaxe</th><th>Ce que ça fait</th></tr>
<tr><td><code>doc is Book</code></td><td>renvoie <code>true</code> si l'objet est un <code>Book</code> (ou un dérivé)</td></tr>
<tr><td><code>doc is Book book</code></td><td>teste <strong>et</strong> crée une variable <code>book</code> de type <code>Book</code> si le test réussit</td></tr>
<tr><td><code>doc as Book</code></td><td>renvoie l'objet vu comme un <code>Book</code>, ou <code>null</code> si ce n'en est pas un</td></tr>
</table>
<p>La forme <code>if (doc is Book book)</code> est la plus utilisée : c'est du <strong>pattern matching</strong> (correspondance de motif). En une ligne, on vérifie le type et on obtient une variable typée, utilisable dans le bloc du <code>if</code>.</p>
<div class="compare"><div><h4>TypeScript</h4><p><code>if (doc instanceof Book) { doc.pages }</code> : le type de <code>doc</code> est affiné automatiquement dans le bloc.</p></div><div><h4>C#</h4><p><code>if (doc is Book book) { book.Pages }</code> : on nomme une nouvelle variable, déjà du bon type.</p></div></div>

<h3>Le <code>switch</code> sur le type</h3>
<p>Quand il y a plusieurs cas, l'expression <code>switch</code> accepte des motifs de type :</p>
<pre class="diagram">string label = doc switch
{
    Book b     =&gt; $"{b.Pages} pages",
    Magazine m =&gt; $"n°{m.Issue}",
    _          =&gt; "autre"
};</pre>
<p>Le <code>_</code> est le cas par défaut (« tout le reste »). Les cas sont testés dans l'ordre, du haut vers le bas.</p>
<div class="tip">Si tu écris beaucoup de <code>switch</code> sur le type pour décider d'un comportement, c'est souvent le signe qu'il manque une méthode virtuelle. Le pattern matching est fait pour les cas particuliers, pas pour remplacer <code>override</code>.</div>
<div class="note">Préfère <code>is</code> avec une variable (<code>is Book book</code>) à <code>as</code> suivi d'un test de <code>null</code> : c'est plus court, et la variable n'existe que là où elle est valide.</div>`,
  examples: [
    {
      title: "Tout le catalogue en une boucle",
      code: `Document[] catalog = [new Book("Dune", "Frank Herbert"), new Magazine("Géo", 512), new Dvd("Matrix", 136)];

foreach (Document doc in catalog)
{
    Console.WriteLine(doc.Describe());
}

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract string Describe();
}

sealed class Book(string title, string author) : Document(title)
{
    public override string Describe() => $"Livre : {Title} de {author}";
}

sealed class Magazine(string title, int issue) : Document(title)
{
    public override string Describe() => $"Magazine : {Title} n°{issue}";
}

sealed class Dvd(string title, int minutes) : Document(title)
{
    public override string Describe() => $"DVD : {Title} ({minutes} min)";
}`,
      output: `Livre : Dune de Frank Herbert
Magazine : Géo n°512
DVD : Matrix (136 min)`,
      steps: [
        `<code>Document[] catalog = [ ... ];</code> : un tableau du type de base, qui contient trois objets de types différents.`,
        `<code>foreach (Document doc in catalog)</code> : la variable de boucle est de type <code>Document</code>.`,
        `<code>doc.Describe()</code> : un seul appel dans le code, mais trois versions exécutées selon l'objet réel.`,
        `<code>public abstract string Describe();</code> : grâce à <code>abstract</code>, chaque document est obligé de savoir se décrire.`
      ],
      explain: "Ajouter un nouveau type de document ne demande aucune modification de la boucle."
    },
    {
      title: "Polymorphisme via une interface (avec une List en aperçu)",
      code: `List<IBorrowable> items = [new Book("Dune"), new Dvd("Matrix")];

foreach (IBorrowable item in items)
{
    item.Borrow("Alice");
}
Console.WriteLine($"{items.Count} emprunts");

interface IBorrowable
{
    void Borrow(string memberName);
}

sealed class Book(string title) : IBorrowable
{
    public void Borrow(string memberName) => Console.WriteLine($"Livre {title} prêté à {memberName}");
}

sealed class Dvd(string title) : IBorrowable
{
    public void Borrow(string memberName) => Console.WriteLine($"DVD {title} prêté à {memberName} pour 7 jours");
}`,
      output: `Livre Dune prêté à Alice
DVD Matrix prêté à Alice pour 7 jours
2 emprunts`,
      steps: [
        `<code>List&lt;IBorrowable&gt; items = [ ... ];</code> : une liste d'objets empruntables. <code>Book</code> et <code>Dvd</code> n'ont aucune classe de base commune (à part <code>object</code>).`,
        `<code>item.Borrow("Alice");</code> : chaque objet applique sa propre version.`,
        `<code>items.Count</code> : le nombre d'éléments d'une liste (pour un tableau, c'est <code>Length</code>).`
      ]
    },
    {
      title: "is, as et switch sur le type",
      code: `Document[] catalog = [new Book("Dune", 412), new Magazine("Géo", 512), new Dvd("Matrix")];

foreach (Document doc in catalog)
{
    if (doc is Book book)
    {
        Console.WriteLine($"{book.Title} : {book.Pages} pages");
    }

    string label = doc switch
    {
        Book => "à lire",
        Magazine magazine => $"numéro {magazine.Issue}",
        _ => "autre"
    };
    Console.WriteLine($"{doc.Title} -> {label}");
}

Dvd? dvd = catalog[2] as Dvd;
Console.WriteLine(dvd is not null);

abstract class Document(string title) { public string Title { get; } = title; }
sealed class Book(string title, int pages) : Document(title) { public int Pages { get; } = pages; }
sealed class Magazine(string title, int issue) : Document(title) { public int Issue { get; } = issue; }
sealed class Dvd(string title) : Document(title) { }`,
      output: `Dune : 412 pages
Dune -> à lire
Géo -> numéro 512
Matrix -> autre
True`,
      steps: [
        `<code>if (doc is Book book)</code> : seulement pour le livre, on obtient une variable <code>book</code> qui donne accès à <code>Pages</code>.`,
        `<code>Book =&gt; "à lire"</code> : un motif de type sans variable, quand on n'a pas besoin des membres.`,
        `<code>Magazine magazine =&gt; $"numéro {magazine.Issue}"</code> : un motif de type avec variable.`,
        `<code>_ =&gt; "autre"</code> : le cas par défaut, ici pour le DVD.`,
        `<code>catalog[2] as Dvd</code> : l'élément 2 est bien un DVD, donc <code>dvd</code> n'est pas <code>null</code> et on affiche <code>True</code>.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter un livre audio",
      prompt: `<p>Reprends le premier exemple. Ajoute une classe <code>AudioBook</code> (titre, narrateur) qui hérite de <code>Document</code>, et ajoute-en un au catalogue. Vérifie que la boucle n'a pas besoin d'être modifiée.</p>`,
      hint: `<p>Il suffit d'une nouvelle classe avec un <code>override</code> de <code>Describe()</code>, et d'un élément de plus dans le tableau.</p>`,
      solution: `Document[] catalog = [new Book("Dune", "Frank Herbert"), new AudioBook("Le Petit Prince", "Gérard Philipe")];
foreach (Document doc in catalog)
{
    Console.WriteLine(doc.Describe());
}

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract string Describe();
}

sealed class Book(string title, string author) : Document(title)
{
    public override string Describe() => $"Livre : {Title} de {author}";
}

sealed class AudioBook(string title, string narrator) : Document(title)
{
    public override string Describe() => $"Livre audio : {Title}, lu par {narrator}";
}`
    },
    {
      level: "moyen",
      title: "Total des pénalités",
      prompt: `<p>Avec une classe abstraite <code>Document</code> qui déclare <code>CalculateLateFee(int daysLate)</code> (livre : 1 €/jour, magazine : 2 €/jour, DVD : 3 €/jour), calcule le total des pénalités pour un catalogue de trois documents rendus avec 5 jours de retard.</p>`,
      hint: `<p>Déclare <code>int total = 0;</code> avant la boucle, puis <code>total += doc.CalculateLateFee(5);</code> dedans.</p>`,
      solution: `Document[] catalog = [new Book("Dune"), new Magazine("Géo"), new Dvd("Matrix")];
int total = 0;
foreach (Document doc in catalog)
{
    total += doc.CalculateLateFee(5);
}
Console.WriteLine($"Total : {total} €"); // Total : 30 €

abstract class Document(string title)
{
    public string Title { get; } = title;
    public abstract int CalculateLateFee(int daysLate);
}

sealed class Book(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate;
}

sealed class Magazine(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate * 2;
}

sealed class Dvd(string title) : Document(title)
{
    public override int CalculateLateFee(int daysLate) => daysLate * 3;
}`
    },
    {
      level: "difficile",
      title: "Emprunter ce qui peut l'être",
      prompt: `<p>Le catalogue est un <code>Document[]</code>. Seuls <code>Book</code> et <code>Dvd</code> implémentent <code>IBorrowable</code>, pas <code>Magazine</code>. Parcours le catalogue : si le document est empruntable, emprunte-le pour « Alice » ; sinon affiche « titre : consultation sur place ».</p>`,
      hint: `<p>On peut tester une interface avec <code>is</code> : <code>if (doc is IBorrowable borrowable)</code>.</p>`,
      solution: `Document[] catalog = [new Book("Dune"), new Magazine("Géo"), new Dvd("Matrix")];
foreach (Document doc in catalog)
{
    if (doc is IBorrowable borrowable)
    {
        borrowable.Borrow("Alice");
    }
    else
    {
        Console.WriteLine($"{doc.Title} : consultation sur place");
    }
}

interface IBorrowable
{
    void Borrow(string memberName);
}

abstract class Document(string title)
{
    public string Title { get; } = title;
}

sealed class Book(string title) : Document(title), IBorrowable
{
    public void Borrow(string memberName) => Console.WriteLine($"{Title} prêté à {memberName}");
}

sealed class Magazine(string title) : Document(title) { }

sealed class Dvd(string title) : Document(title), IBorrowable
{
    public void Borrow(string memberName) => Console.WriteLine($"{Title} prêté à {memberName}");
}`
    }
  ],
  quiz: [
    {
      q: `Dans <code>foreach (Document doc in catalog) doc.Describe();</code>, quand est choisie la version de <code>Describe</code> exécutée ?`,
      options: [`À la compilation, d'après le type <code>Document</code>`, `À l'exécution, d'après l'objet réel`, `Au premier appel, puis la même pour tous les éléments`],
      answer: 1,
      why: `Pour une méthode virtuelle ou abstraite, le choix se fait à l'exécution, pour chaque objet. Le compilateur vérifie seulement que la méthode existe dans <code>Document</code>.`
    },
    {
      q: `Que fait <code>if (doc is Book book) { ... }</code> ?`,
      options: [`Convertit <code>doc</code> en <code>Book</code> et lève une exception si c'est impossible`, `Crée un nouveau livre à partir de <code>doc</code>`, `Teste si <code>doc</code> est un <code>Book</code> et, si oui, fournit une variable <code>book</code> typée`],
      answer: 2,
      why: `C'est du pattern matching : un test de type et une déclaration de variable en une seule expression. Aucune exception si le test échoue : on n'entre simplement pas dans le bloc.`
    },
    {
      q: `<code>Document doc = new Magazine("Géo");</code> Que vaut <code>doc as Book</code> ?`,
      options: [`<code>null</code>`, `Un <code>Book</code> vide`, `Une erreur de compilation`],
      answer: 0,
      why: `<code>as</code> renvoie <code>null</code> quand la conversion est impossible, sans exception. Un magazine n'est pas un livre.`
    }
  ],
  project: `<p>Dans <code>Program.cs</code>, crée un tableau <code>Document[] catalog</code> avec au moins deux livres et deux magazines, puis affiche tout le catalogue avec une seule boucle qui appelle <code>Describe()</code>. Affiche ensuite le nombre de documents empruntables (ceux qui sont <code>IBorrowable</code>).</p>`,
  resources: [
    { label: "Polymorphisme (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/object-oriented/polymorphism" },
    { label: "Opérateur is et pattern matching (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/is" }
  ]
});

// ===================== 3.15 Classe abstraite ou interface ? Composition =====================
window.COURSE.push({
  key: "l-abstract-vs-interface",
  title: "Classe abstraite ou interface ? Composition",
  summary: "Tu sauras choisir entre classe abstraite et interface, et remplacer un héritage mal choisi par de la composition.",
  objectives: [
    "Choisir entre classe abstraite et interface avec des critères simples",
    "Distinguer « est un » (héritage) et « a un » (composition)",
    "Repérer les signes d'un héritage mal choisi",
    "Refactorer un héritage trop profond vers de la composition"
  ],
  analogy: `<p>Une voiture <em>a un</em> moteur. Elle n'<em>est</em> pas un moteur : personne ne dirait « une voiture est une sorte de moteur avec des roues ». Et c'est très pratique : on peut changer le moteur (essence, électrique) sans refaire la voiture. Construire un objet en assemblant d'autres objets, c'est la <strong>composition</strong>. C'est souvent plus souple que l'héritage.</p>`,
  lesson: `<h3>Deux outils qui se ressemblent</h3>
<p>Classe abstraite et interface décrivent toutes les deux des membres que d'autres classes devront fournir, et les deux permettent le polymorphisme. Alors, laquelle choisir ? La réponse tient en une question : <strong>veux-tu partager du code et des données, ou seulement un contrat ?</strong></p>
<table>
<tr><th>Critère</th><th>Classe abstraite</th><th>Interface</th></tr>
<tr><td>État partagé (champs, propriétés avec valeur)</td><td>oui</td><td>non</td></tr>
<tr><td>Constructeur</td><td>oui</td><td>non</td></tr>
<tr><td>Code commun (méthodes avec corps)</td><td>oui</td><td>presque jamais (membres par défaut, cas avancé)</td></tr>
<tr><td>Héritage multiple</td><td>non : une seule base</td><td>oui : autant qu'on veut</td></tr>
<tr><td>Relation exprimée</td><td>« est un »</td><td>« sait faire »</td></tr>
</table>

<h3>Exemples de choix</h3>
<ul>
<li><code>Document</code> : tous les documents ont un titre, une année, un reçu identique. Il y a de l'état et du code commun : <strong>classe abstraite</strong>.</li>
<li><code>IBorrowable</code> : livres, DVD, liseuses peuvent s'emprunter, mais une liseuse n'est pas un document. C'est une capacité transversale : <strong>interface</strong>.</li>
<li><code>IComparable&lt;T&gt;</code> : n'importe quoi peut être comparable, un livre comme une date : <strong>interface</strong>.</li>
</ul>
<p>Les deux se combinent très bien : <code>class Book : Document, IBorrowable</code>. Règle pratique : commence par une interface ; passe à une classe abstraite quand tu constates du code dupliqué entre les implémentations.</p>

<h3>Composition plutôt qu'héritage</h3>
<p>La <strong>composition</strong>, c'est quand un objet contient d'autres objets et leur délègue une partie du travail. Au lieu de « <code>Car</code> hérite de <code>Engine</code> », on écrit « <code>Car</code> a une propriété <code>Engine</code> ». Déléguer veut dire : confier le travail à l'objet contenu.</p>
<div class="compare"><div><h4>Héritage (« est un »)</h4><p>Lien fixé à la compilation. La classe dérivée dépend des détails de sa base. Une seule base possible.</p></div><div><h4>Composition (« a un »)</h4><p>Lien entre objets, modifiable. On combine plusieurs pièces et on en change une sans toucher aux autres.</p></div></div>
<p>Le conseil célèbre « préfère la composition à l'héritage » ne veut pas dire « n'hérite jamais ». Il veut dire : n'hérite pas juste pour réutiliser du code. Si la relation « est un » n'est pas évidente, compose.</p>

<h3>Refactorer un héritage trop profond</h3>
<p>Imagine qu'on ait géré les tarifs de pénalité par l'héritage :</p>
<pre class="diagram">Document
 +-- Book
      +-- BorrowableBook
           +-- RareBorrowableBook
                +-- RareBorrowableSignedBook</pre>
<p>Chaque nouvelle règle crée un niveau. Un livre rare mais non empruntable ? Impossible sans dupliquer. La solution : extraire ce qui varie (le calcul de la pénalité) dans un objet à part, et le donner au livre.</p>
<pre class="diagram">Book ---- a un ----&gt; ILateFeePolicy
                       +-- DailyFee
                       +-- FlatFee</pre>
<div class="flow"><span>book.LateFee(10)</span><span>feePolicy.Calculate(10)</span><span>DailyFee ou FlatFee</span></div>
<p>Changer le tarif d'un livre revient à lui donner une autre politique. Ajouter un tarif revient à écrire une petite classe. Aucun nouveau niveau d'héritage.</p>

<h3>Les signes d'un héritage mal choisi</h3>
<ul>
<li>La phrase « X est un Y » sonne faux (« un membre est une liste de livres »).</li>
<li>La classe dérivée redéfinit une méthode juste pour lever une exception « non supporté ».</li>
<li>Les noms de classes s'allongent en empilant des adjectifs (<code>RareBorrowableSignedBook</code>).</li>
<li>Tu hérites uniquement pour récupérer une ou deux méthodes utilitaires.</li>
<li>Modifier la base casse régulièrement des classes dérivées.</li>
</ul>
<div class="tip">Un bon test : si tu voudrais pouvoir changer ce comportement pendant l'exécution (le tarif d'un livre, le moteur d'une voiture), c'est de la composition. Un objet ne peut pas changer de classe, mais il peut changer de pièce.</div>
<div class="note">Dans les applications ASP.NET Core que tu écriras plus tard, la composition est partout : les services reçoivent d'autres services dans leur constructeur (l'injection de dépendances). Les arbres d'héritage profonds y sont rares.</div>`,
  examples: [
    {
      title: "Une voiture a un moteur",
      code: `Car car = new Car(new Engine(110));
car.Start();
Console.WriteLine($"Puissance : {car.Engine.HorsePower} ch");

class Engine(int horsePower)
{
    public int HorsePower { get; } = horsePower;
    public void Start() => Console.WriteLine("Le moteur démarre");
}

class Car(Engine engine)
{
    // la voiture A UN moteur : une propriété, pas une classe de base
    public Engine Engine { get; } = engine;

    public void Start()
    {
        Engine.Start();
        Console.WriteLine("La voiture roule");
    }
}`,
      output: `Le moteur démarre
La voiture roule
Puissance : 110 ch`,
      steps: [
        `<code>class Car(Engine engine)</code> : la voiture reçoit son moteur à la construction, elle n'en hérite pas.`,
        `<code>public Engine Engine { get; } = engine;</code> : une propriété de type <code>Engine</code>. Nommer une propriété comme son type est courant en C#.`,
        `<code>Engine.Start();</code> : la voiture <strong>délègue</strong> le démarrage à son moteur, puis ajoute son propre comportement.`,
        `<code>new Car(new Engine(110))</code> : on assemble les pièces. Pour un autre moteur, on passe un autre objet.`
      ]
    },
    {
      title: "Des tarifs de pénalité par composition",
      code: `Book novel = new Book("Dune", new DailyFee(2));
Book rare = new Book("Manuscrit ancien", new FlatFee(50));
Console.WriteLine($"{novel.Title} : {novel.LateFee(10)} €");
Console.WriteLine($"{rare.Title} : {rare.LateFee(10)} €");

interface ILateFeePolicy
{
    int Calculate(int daysLate);
}

sealed class DailyFee(int perDay) : ILateFeePolicy
{
    public int Calculate(int daysLate) => daysLate * perDay;
}

sealed class FlatFee(int amount) : ILateFeePolicy
{
    public int Calculate(int daysLate) => daysLate > 0 ? amount : 0;
}

sealed class Book(string title, ILateFeePolicy feePolicy)
{
    public string Title { get; } = title;

    // le livre délègue le calcul à sa politique de pénalité
    public int LateFee(int daysLate) => feePolicy.Calculate(daysLate);
}`,
      output: `Dune : 20 €
Manuscrit ancien : 50 €`,
      steps: [
        `<code>interface ILateFeePolicy</code> : le contrat « savoir calculer une pénalité ».`,
        `<code>sealed class DailyFee(int perDay)</code> : un tarif par jour. <code>sealed class FlatFee(int amount)</code> : un forfait dès le premier jour de retard.`,
        `<code>sealed class Book(string title, ILateFeePolicy feePolicy)</code> : un seul type de livre, qui <strong>a</strong> une politique de pénalité.`,
        `<code>feePolicy.Calculate(daysLate)</code> : délégation ; 10 jours × 2 € = 20 € pour le roman, forfait de 50 € pour le manuscrit.`,
        `<code>new Book("Manuscrit ancien", new FlatFee(50))</code> : pas besoin d'une classe <code>RareBook</code>, on change juste la pièce.`
      ],
      explain: "Ajouter un tarif, c'est écrire une petite classe ; aucun livre n'est modifié."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Classe abstraite ou interface ?",
      prompt: `<p>Pour chaque cas, choisis classe abstraite ou interface et justifie en une phrase : (1) « imprimable », pour des reçus, des cartes de membre et des listes ; (2) <code>Person</code>, avec prénom, nom et email, base de <code>Member</code> et <code>Librarian</code> ; (3) « notifier », envoi d'un message par email ou SMS. Écris ensuite la déclaration de <code>Person</code> et de <code>Member</code>.</p>`,
      hint: `<p>Cherche s'il y a des données communes (alors classe abstraite) ou seulement une capacité partagée par des objets sans rapport (alors interface).</p>`,
      solution: `// 1. Interface IPrintable : reçus, cartes et listes n'ont rien en commun sauf la capacité d'être imprimés.
// 2. Classe abstraite Person : Member et Librarian partagent des données (prénom, nom, email).
// 3. Interface INotifier : un contrat « envoyer un message », implémenté par EmailNotifier et SmsNotifier.

Member member = new Member("Alice", "Martin", "alice@mail.fr");
Console.WriteLine(member.FullName); // Alice Martin

abstract class Person(string firstName, string lastName, string email)
{
    public string FirstName { get; } = firstName;
    public string LastName { get; } = lastName;
    public string Email { get; } = email;
    public string FullName => $"{FirstName} {LastName}";
}

sealed class Member(string firstName, string lastName, string email) : Person(firstName, lastName, email) { }`
    },
    {
      level: "moyen",
      title: "Une politique plafonnée",
      prompt: `<p>Reprends le deuxième exemple. Ajoute une politique <code>CappedDailyFee</code> : un tarif par jour, mais jamais plus qu'un plafond (par exemple 2 €/jour plafonné à 15 €). Donne-la à un livre et teste avec 3 et 10 jours de retard.</p>`,
      hint: `<p><code>Math.Min(daysLate * perDay, cap)</code>.</p>`,
      solution: `Book book = new Book("Fondation", new CappedDailyFee(2, 15));
Console.WriteLine(book.LateFee(3));  // 6
Console.WriteLine(book.LateFee(10)); // 15

interface ILateFeePolicy
{
    int Calculate(int daysLate);
}

sealed class CappedDailyFee(int perDay, int cap) : ILateFeePolicy
{
    public int Calculate(int daysLate) => Math.Min(daysLate * perDay, cap);
}

sealed class Book(string title, ILateFeePolicy feePolicy)
{
    public string Title { get; } = title;
    public int LateFee(int daysLate) => feePolicy.Calculate(daysLate);
}`
    },
    {
      level: "difficile",
      title: "Changer de politique en cours de route",
      prompt: `<p>Pendant une semaine d'amnistie, la bibliothèque supprime les pénalités. Ajoute une politique <code>NoFee</code> et rends la politique du livre modifiable avec une méthode <code>ChangePolicy(ILateFeePolicy policy)</code>. Affiche la pénalité d'un livre avant et pendant l'amnistie.</p>`,
      hint: `<p>Stocke la politique dans une propriété privée modifiable, initialisée depuis le paramètre du constructeur. C'est un avantage que l'héritage n'offre pas : un objet ne peut pas changer de classe.</p>`,
      solution: `Book book = new Book("Dune", new DailyFee(2));
Console.WriteLine($"Avant : {book.LateFee(5)} €");    // 10 €
book.ChangePolicy(new NoFee());
Console.WriteLine($"Amnistie : {book.LateFee(5)} €"); // 0 €

interface ILateFeePolicy
{
    int Calculate(int daysLate);
}

sealed class DailyFee(int perDay) : ILateFeePolicy
{
    public int Calculate(int daysLate) => daysLate * perDay;
}

sealed class NoFee : ILateFeePolicy
{
    public int Calculate(int daysLate) => 0;
}

sealed class Book(string title, ILateFeePolicy feePolicy)
{
    public string Title { get; } = title;
    private ILateFeePolicy Policy { get; set; } = feePolicy;

    public void ChangePolicy(ILateFeePolicy policy) => Policy = policy;
    public int LateFee(int daysLate) => Policy.Calculate(daysLate);
}`
    }
  ],
  quiz: [
    {
      q: `Tu veux partager une propriété <code>Title</code> et une méthode <code>Receipt()</code> déjà codée entre plusieurs classes. Que choisis-tu ?`,
      options: [`Une classe abstraite`, `Une interface`, `Peu importe, c'est équivalent`],
      answer: 0,
      why: `Il y a de l'état et du code commun : c'est le rôle d'une classe abstraite. Une interface décrit un contrat, sans données.`
    },
    {
      q: `Quelle phrase décrit la composition ?`,
      options: [`« Une voiture est un moteur »`, `« Une voiture a un moteur »`, `« Une voiture hérite d'un moteur »`],
      answer: 1,
      why: `La composition exprime « a un » : un objet en contient un autre et lui délègue du travail. « Est un » décrit l'héritage.`
    },
    {
      q: `Lequel de ces signes indique un héritage mal choisi ?`,
      options: [`La classe dérivée redéfinit une méthode virtuelle`, `La classe dérivée est <code>sealed</code>`, `La classe dérivée redéfinit une méthode pour lever une exception « non supporté »`],
      answer: 2,
      why: `Si une classe dérivée doit refuser une partie du comportement de sa base, elle n'« est » pas vraiment cette base. Redéfinir une méthode virtuelle, en revanche, est un usage normal.`
    }
  ],
  resources: [
    { label: "Interfaces en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/interfaces" }
  ]
});

// ===================== 3.16 Namespaces et organisation du code =====================
window.COURSE.push({
  key: "l-namespaces",
  title: "Namespaces et organisation du code",
  summary: "Tu sauras ranger tes classes dans des namespaces et des dossiers, les importer avec using et régler un conflit de noms.",
  objectives: [
    "Déclarer un namespace, y compris en version file-scoped",
    "Importer un namespace avec <code>using</code> et <code>global using</code>",
    "Organiser un projet en dossiers qui correspondent aux namespaces",
    "Résoudre un conflit de noms avec un alias"
  ],
  analogy: `<p>Sur ton disque, tu peux avoir deux fichiers <code>rapport.pdf</code>, à condition qu'ils soient dans des dossiers différents : <code>Travail/rapport.pdf</code> et <code>Perso/rapport.pdf</code>. Le dossier fait partie du nom complet. Un namespace, c'est la même chose pour les types : <code>Library.Models.Book</code> et <code>Shop.Models.Book</code> sont deux classes différentes qui portent le même nom court.</p>`,
  lesson: `<h3>Un dossier pour les noms</h3>
<p>Un <strong>namespace</strong> (espace de noms) regroupe des types sous un préfixe. Le nom complet d'une classe devient <code>Namespace.Classe</code>. Tu en utilises déjà sans le savoir : <code>Console</code> s'appelle en réalité <code>System.Console</code>, et <code>List&lt;T&gt;</code> vit dans <code>System.Collections.Generic</code>.</p>
<p>Les namespaces servent à deux choses : éviter les collisions de noms, et organiser le code par thème. Par convention, ils commencent par le nom du projet, puis le thème : <code>Library.Models</code>, <code>Library.Services</code>.</p>

<h3>Deux façons de déclarer</h3>
<div class="compare"><div><h4>Namespace en bloc</h4><p><code>namespace Library.Models { class Book { } }</code> : tout ce qui est entre les accolades appartient au namespace. Un niveau d'indentation de plus.</p></div><div><h4>File-scoped (C# 10)</h4><p><code>namespace Library.Models;</code> en haut du fichier : tout le fichier appartient au namespace. Pas d'accolades, pas d'indentation en plus.</p></div></div>
<p>La version <strong>file-scoped</strong> est le standard actuel : un fichier, un namespace, une ligne. Une limite : elle ne peut pas cohabiter avec des top-level statements dans le même fichier. C'est pour ça que les exemples de cette leçon (tout dans <code>Program.cs</code>) utilisent la forme en bloc. Dans un vrai projet, chaque classe a son fichier et sa ligne <code>namespace ...;</code>.</p>

<h3><code>using</code>, <code>global using</code> et ImplicitUsings</h3>
<p>Écrire <code>Library.Models.Book</code> partout serait pénible. La directive <code>using Library.Models;</code> en haut d'un fichier permet ensuite d'écrire juste <code>Book</code>. Elle se place avant tout le reste du fichier.</p>
<p><code>global using Library.Models;</code> fait la même chose pour <strong>tous</strong> les fichiers du projet. On regroupe souvent ces lignes dans un fichier <code>GlobalUsings.cs</code>.</p>
<p>Pourquoi n'écris-tu jamais <code>using System;</code> ? Parce que le fichier <code>.csproj</code> contient <code>&lt;ImplicitUsings&gt;enable&lt;/ImplicitUsings&gt;</code>. Le SDK génère alors des <code>global using</code> pour les namespaces les plus courants : <code>System</code>, <code>System.IO</code>, <code>System.Linq</code>, <code>System.Collections.Generic</code>, <code>System.Threading.Tasks</code>, entre autres.</p>
<div class="flow"><span>.csproj : ImplicitUsings</span><span>global using générés</span><span>Console, List... utilisables partout</span></div>

<h3>Un type par fichier, dossiers = namespaces</h3>
<p>La convention .NET est simple : un type par fichier, le fichier porte le nom du type, et le chemin des dossiers suit le namespace. Visual Studio et Rider proposent même de corriger un namespace qui ne correspond pas à son dossier.</p>
<pre class="diagram">Library/                  (projet)
  Library.csproj
  Program.cs
  Models/
    Document.cs     namespace Library.Models;
    Book.cs         namespace Library.Models;
    Magazine.cs     namespace Library.Models;
    Member.cs       namespace Library.Models;
    IBorrowable.cs  namespace Library.Models;
  Services/
    Catalog.cs      namespace Library.Services;</pre>
<p><code>Models</code> contient les données (ce que l'application manipule), <code>Services</code> contient la logique (ce que l'application fait avec). Tu retrouveras ce découpage dans les API ASP.NET Core.</p>

<h3>Conflits de noms et alias</h3>
<p>Si deux namespaces importés contiennent chacun une classe <code>Book</code>, écrire <code>Book</code> est ambigu : erreur CS0104. Deux solutions : écrire le nom complet (<code>Shop.Models.Book</code>), ou créer un <strong>alias</strong> avec <code>using ShopBook = Shop.Models.Book;</code>. L'alias est un surnom, valable dans le fichier.</p>

<h3>Et en TypeScript ?</h3>
<table>
<tr><th>TypeScript</th><th>C#</th></tr>
<tr><td>Chaque fichier est un module</td><td>Tous les fichiers d'un projet se voient ; le namespace fait le regroupement</td></tr>
<tr><td><code>export class Book</code></td><td><code>public class Book</code> (visible hors du projet)</td></tr>
<tr><td><code>import { Book } from './models/book'</code></td><td><code>using Library.Models;</code> : on importe un namespace, pas un fichier</td></tr>
<tr><td><code>import { Book as ShopBook } from ...</code></td><td><code>using ShopBook = Shop.Models.Book;</code></td></tr>
</table>
<div class="tip">En C#, on n'importe jamais un fichier. Déplacer <code>Book.cs</code> dans un autre dossier ne casse aucun <code>using</code> : seul le namespace écrit dans le fichier compte.</div>`,
  examples: [
    {
      title: "Déclarer un namespace et l'importer",
      code: `using Library.Models;

Book book = new Book("Dune");
Console.WriteLine(book.Title);
Console.WriteLine(typeof(Book).FullName);

namespace Library.Models
{
    public class Book(string title)
    {
        public string Title { get; } = title;
    }
}`,
      output: `Dune
Library.Models.Book`,
      steps: [
        `<code>using Library.Models;</code> : tout en haut du fichier, avant les top-level statements.`,
        `<code>namespace Library.Models { ... }</code> : la classe <code>Book</code> appartient à ce namespace.`,
        `<code>new Book("Dune")</code> : grâce au <code>using</code>, le nom court suffit.`,
        `<code>typeof(Book).FullName</code> : renvoie le nom complet du type, namespace compris.`
      ]
    },
    {
      title: "Deux classes Book et un alias",
      code: `using Library.Models;
using ShopBook = Shop.Models.Book;

Book loanBook = new Book("Dune");
ShopBook saleBook = new ShopBook("Dune", 12);

Console.WriteLine(loanBook.GetType().FullName);
Console.WriteLine(saleBook.GetType().FullName);
Console.WriteLine($"{saleBook.Title} : {saleBook.Price} €");

namespace Library.Models
{
    public class Book(string title)
    {
        public string Title { get; } = title;
    }
}

namespace Shop.Models
{
    public class Book(string title, int price)
    {
        public string Title { get; } = title;
        public int Price { get; } = price;
    }
}`,
      output: `Library.Models.Book
Shop.Models.Book
Dune : 12 €`,
      steps: [
        `<code>namespace Library.Models</code> et <code>namespace Shop.Models</code> : deux classes <code>Book</code> différentes, sans conflit, car leurs noms complets diffèrent.`,
        `<code>using ShopBook = Shop.Models.Book;</code> : un alias ; <code>ShopBook</code> désigne la classe de la boutique.`,
        `<code>Book loanBook</code> : <code>Book</code> désigne celle de <code>Library.Models</code>, seul namespace importé en entier.`,
        `<code>GetType().FullName</code> : confirme quel type a été créé.`
      ],
      explain: "Si on avait aussi écrit using Shop.Models;, le simple nom Book deviendrait ambigu (erreur CS0104)."
    },
    {
      title: "Models et Services",
      code: `using Library.Models;
using Library.Services;

Catalog catalog = new Catalog();
catalog.Add(new Book("Dune"));
catalog.Add(new Book("Fondation"));
catalog.PrintAll();

namespace Library.Models
{
    public class Book(string title)
    {
        public string Title { get; } = title;
    }
}

namespace Library.Services
{
    // dans un vrai fichier Services/Catalog.cs, on écrirait using Library.Models; en haut
    public class Catalog
    {
        private readonly List<Book> books = [];
        public void Add(Book book) => books.Add(book);
        public void PrintAll()
        {
            foreach (Book book in books) Console.WriteLine($"- {book.Title}");
        }
    }
}`,
      output: `- Dune
- Fondation`,
      steps: [
        `<code>namespace Library.Models</code> : les données.`,
        `<code>namespace Library.Services</code> : la logique, qui utilise les modèles. Ici, le <code>using Library.Models;</code> du haut du fichier suffit.`,
        `<code>private readonly List&lt;Book&gt; books = [];</code> : <code>List</code> est disponible sans <code>using</code> grâce aux ImplicitUsings.`,
        `<code>using Library.Services;</code> : <code>Program.cs</code> importe les deux namespaces dont il a besoin.`,
        `<code>catalog.PrintAll();</code> : le programme principal ne fait qu'orchestrer ; chaque responsabilité est rangée à sa place.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Nom complet sans using",
      prompt: `<p>Déclare une classe <code>Member</code> dans le namespace <code>Library.Models</code>. Dans le programme, crée un membre <strong>sans</strong> écrire de <code>using</code>, en utilisant le nom complet du type.</p>`,
      hint: `<p><code>Library.Models.Member member = new Library.Models.Member("Alice");</code></p>`,
      solution: `Library.Models.Member member = new Library.Models.Member("Alice");
Console.WriteLine(member.Name); // Alice

namespace Library.Models
{
    public class Member(string name)
    {
        public string Name { get; } = name;
    }
}`
    },
    {
      level: "moyen",
      title: "Un conflit avec System.Threading.Tasks",
      prompt: `<p>Tu veux une classe <code>Task</code> (une tâche du bibliothécaire : « ranger le rayon B ») dans <code>Library.Models</code>. Mais <code>System.Threading.Tasks.Task</code> est déjà importé par les ImplicitUsings. Crée ta classe et utilise-la dans le programme grâce à un alias <code>LibraryTask</code>.</p>`,
      hint: `<p><code>using LibraryTask = Library.Models.Task;</code> en haut du fichier.</p>`,
      solution: `using LibraryTask = Library.Models.Task;

LibraryTask task = new LibraryTask("Ranger le rayon B");
Console.WriteLine(task.Description); // Ranger le rayon B

namespace Library.Models
{
    public class Task(string description)
    {
        public string Description { get; } = description;
    }
}`
    },
    {
      level: "difficile",
      title: "Réorganiser la Bibliothèque",
      prompt: `<p>Dans un vrai projet (<code>dotnet new console -n Library</code>), crée les dossiers <code>Models</code> et <code>Services</code>. Mets <code>Document</code>, <code>Book</code> et <code>IBorrowable</code> dans <code>Models</code> (un fichier chacun, namespace file-scoped), une classe <code>Catalog</code> dans <code>Services</code>, et un fichier <code>GlobalUsings.cs</code> qui importe les deux namespaces pour tout le projet. Écris le contenu de <code>GlobalUsings.cs</code>, <code>Models/Book.cs</code> et <code>Program.cs</code>.</p>`,
      hint: `<p>Dans <code>Book.cs</code>, la première ligne est <code>namespace Library.Models;</code>. Avec <code>GlobalUsings.cs</code>, <code>Program.cs</code> n'a plus besoin d'aucun <code>using</code>.</p>`,
      solution: `// ===== GlobalUsings.cs =====
global using Library.Models;
global using Library.Services;

// ===== Models/Book.cs =====
namespace Library.Models;

public sealed class Book(string title, string author) : Document(title), IBorrowable
{
    public string Author { get; } = author;
    public bool IsAvailable { get; private set; } = true;

    public override string Describe() => $"Livre : {Title} de {Author}";
    public void Borrow(string memberName) => IsAvailable = false;
    public void Return() => IsAvailable = true;
}

// ===== Program.cs =====
Catalog catalog = new Catalog();
catalog.Add(new Book("Dune", "Frank Herbert"));
catalog.PrintAll();`
    }
  ],
  quiz: [
    {
      q: `Pourquoi peut-on écrire <code>Console.WriteLine</code> sans <code>using System;</code> ?`,
      options: [`Parce que <code>Console</code> n'appartient à aucun namespace`, `Parce que les ImplicitUsings génèrent un <code>global using System;</code>`, `Parce que <code>Program.cs</code> importe tout automatiquement`],
      answer: 1,
      why: `<code>Console</code> est bien dans <code>System</code>. C'est l'option <code>ImplicitUsings</code> du <code>.csproj</code> qui ajoute des <code>global using</code> pour les namespaces courants, dans tout le projet.`
    },
    {
      q: `Quelle est la syntaxe d'un namespace file-scoped ?`,
      options: [`<code>namespace Library.Models;</code>`, `<code>namespace Library.Models { }</code>`, `<code>using namespace Library.Models;</code>`],
      answer: 0,
      why: `La forme file-scoped se termine par un point-virgule et s'applique à tout le fichier. La forme avec accolades est la version en bloc.`
    },
    {
      q: `Deux namespaces importés contiennent une classe <code>Book</code>. Que se passe-t-il si tu écris <code>Book b = ...</code> ?`,
      options: [`Le premier <code>using</code> l'emporte`, `Le dernier <code>using</code> l'emporte`, `Erreur de compilation : référence ambiguë`],
      answer: 2,
      why: `Le compilateur ne choisit pas pour toi : c'est l'erreur CS0104. On la règle avec le nom complet ou un alias <code>using X = ...;</code>.`
    },
    {
      q: `Quel est l'équivalent C# de <code>import { Book } from './models/book'</code> ?`,
      options: [`<code>using ./Models/Book.cs;</code>`, `<code>using Library.Models;</code>`, `<code>import Library.Models.Book;</code>`],
      answer: 1,
      why: `En C#, on importe un namespace, jamais un fichier. Le chemin du fichier n'a aucune importance pour le compilateur.`
    }
  ],
  project: `<p>Réorganise ton projet Bibliothèque : un dossier <code>Models/</code> (<code>Document</code>, <code>Book</code>, <code>Magazine</code>, <code>Member</code>, <code>IBorrowable</code>, un fichier chacun, namespace <code>Library.Models</code> en file-scoped) et un dossier <code>Services/</code> (une classe <code>Catalog</code> qui garde les documents et sait les afficher, namespace <code>Library.Services</code>). <code>Program.cs</code> ne doit plus contenir que le code de démarrage. Vérifie avec <code>dotnet run</code> que tout fonctionne comme avant.</p>`,
  resources: [
    { label: "Namespaces en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/namespaces" },
    { label: "Directive using (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/using-directive" }
  ]
});
