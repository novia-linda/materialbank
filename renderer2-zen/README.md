# Renderer 2.0 – Zen (prototyp)

En **ny, separat** pedagogisk Moodle-renderare med medvetet minimal översikt. Bygger på arbetsprincipen `SOURCE Page → STYLE Page → RENDERER`, med fem exempelsteg: **Läs, Se, Gör, Kontrollera, Fördjupa**. De fem orden är **inte** hårdkodade; innehållet styrs av H3 i källan.

**Status:** funktionsprototyp, inte publicerad i Moodle. Testad lokalt för visning och interaktion. Koden har inte validerats i Novias aktuella Moodle/TinyMCE efter inklistring.

## Öppna demo

**iPhone:** En HTML-fil som öppnas direkt från ChatGPT-appen eller iOS Filer kan visas utan att JavaScript får köras. Det är därför den ursprungliga demon kunde visa ett stort tomt område. Den uppdaterade demon innehåller nu en statisk, öppningsbar fallback med alla fem moment. För full interaktivitet rekommenderas GitHub Pages-länken i Safari.


Öppna `index.html` via en lokal webbserver (t.ex. `python -m http.server 8765`) eller i GitHub Pages. Direktöppning med `file://` kan blockera SOURCE-fetchen.

Demo använder fiktiva försäljningsvärden. Övningslänken är relativ (`./ovningsdata.html`) för paketets webbdemo; ersätt den med **en absolut riktig URL** i Moodle-SOURCE när övningsfilen publicerats. Kontrollvärdet för Vasa/september är **2 500 € exklusive moms**, beräknat från de fyra fiktiva Vasa-posterna 520 + 840 + 760 + 380. Övningsdata finns i `ovningsdata.html` och kan kopieras till Excel.

## Använd i Moodle – tre objekt

1. Skapa en **Moodle Page** för SOURCE. Öppna källkod i TinyMCE och klistra in innehållet i `source-demo.html`, ändra till eget ämne. Den synliga källsidan ska ha `id="ZENRENDERSOURCE20"`.
2. Skapa en andra **Moodle Page** för STYLE, klistra in `style-demo.html` med `id="ZENRENDERSTYLE20"`. Färgerna kan bytas utan att röra renderaren.
3. Skapa en **Text och media/etikett** för renderaren. Klistra in hela innehållet i `renderer-moodle.html`. **Ersätt båda `000000` med aktuella Moodle Page-ID:n** (`/mod/page/view.php?id=...`). Uppdatera root-ID och lagringsnyckel om flera kopior ska finnas på samma Moodle-sida.
4. Testa i den faktiska studentvyn, särskilt video-, hjälp- och frågefält, mobilvy och behörighet till videolänken. Koden förutsätter att din Moodle-konfiguration accepterar `<script>` enligt den redan verifierade tidigare arkitekturen.

## Minimal SOURCE-syntax

- `H2` – lektionens titel
- `Eyebrow:`, `Mål:`, `Time budget:` – metadata före första H3
- `H3` – eget moment (kan heta annat än Läs/Se/Gör)
- `Kort:`, `Tid:` – en rad i stängd översikt
- `P`, `UL`, `OL`, `IMG`, `TABLE`, `H5`, `H6` – normalt innehåll
- `H4` – utfällbar hjälp, nästa H4 blir syskon
- `[[END H4]]` – avslutar hjälp men inte huvudmoment
- `Tips:`, `Viktigt:` – diskreta callouts
- `Checklista:` + nästa lista – klickbara, lokalt sparade kryssrutor
- `Video:`, `Videourl:`, `Videoinfo:`, `Videobeskrivning:` – video eller reservlänk
- `Videoembed:` – uttrycklig säker HTTPS-iframe-URL från YouTube no-cookie eller SharePoint/Stream
- `Övning:`, `Övningsurl:` – länk till övningsfil eller övningssida
- `Fråga:`, `Facit:`, `Tolerans:`, `Enhet:`, `Ledtråd:`, `Rätt feedback:`, `Fel feedback:` – formativ numerisk kontroll
- `Pedagogisk modell: PED-01, PED-04` och `Material-ID:` – metadata för lärarens system, ej synlig i studentvyn

## Kopplingar och källförvaltning

- **Bildeditor:** bilder publicerade på GitHub kan länkas eller läggas in med vanlig `<img>` i SOURCE. Redigerbara bildlager är ännu inte automatiskt synkade.
- **Videoeditor:** ladda upp den färdiga videon till en lämplig videoplattform och lägg in dess länk i SOURCE. Videoeditor-appens GitHub-publicering är ännu inte verifierad; detta paket innehåller ingen videorenderingsmotor.
- **Notion:** innehållets pedagogiska upplägg har hämtat inspiration från "Min pedagogiska kompass" och "Pedagogiska modeller och uppgiftsmönster" (PED-01, PED-02, PED-04, PED-12). Inga automatiska Notion-skrivningar ingår.
- **Moodle:** SOURCE- och STYLE-sidor ligger i Moodle; renderaren visar materialet. Resultat på självkontroller lagras **inte** i Moodles betygsbok.

## Videolagring och integritet

**Föreslagen huvudlösning:** SharePoint/Stream för Novia-videor, enbart URL i SOURCE och tillgång via rätt studentgrupp. Stream-inbäddningar behöver testas med kursdeltagarnas rättigheter och på mobil; renderaren ger också en separat länk. För öppet/publicerbart material kan olistad YouTube fungera, men länken är inte privat. GitHub Pages bör inte vara videobibliotek på grund av storleks- och trafikgränser.

**Viktigt:** Facit och numeriska kontrollfrågor i SOURCE är synliga i sidans källkod; använd därför endast för **övning och formativ återkoppling**, inte säkra tenter. För poänggivande prestation: använd Moodles Quiz/Assignment med korrekta behörigheter.

## Filer

- `index.html` – visuellt test i webbläsaren
- `source-demo.html` – redigerbar lärarkälla för Moodle Page
- `style-demo.html` – palettkälla för Moodle Page
- `renderer-moodle.html` – självbärande kod till Moodle Text och media
- `renderer-core.js` – identisk renderlogik för webbdemon
- `ovningsdata.html` – fiktivt övningsdata i tabellform för Excel