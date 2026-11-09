# Lindas läsrum – från GitHub till din iPhone

Appen är förberedd för Vercel + Firebase. Du aktiverar ditt eget Firebase-projekt och kopplar Vercel enligt stegen nedan. Inga konton, lösenord eller betalplaner skapas av koden.

## Vad du får

- Samma hyllvy och Instagramliknande flöde som i piloten.
- Ljust, mörkt och telefonens utseende; menyer bakom … och hamburgaren.
- Favoriter, kvitteringar, anteckningar, hashtaggar, etiketter och sökning.
- Teman och källor som du kan ändra i appen.
- Inloggning med användarnamn och lösenord. Inga mejl skickas.
- Sparande i Firebase, tillgängligt på flera enheter efter omladdning.
- Hämtningsprogram för RSS, YouTube och offentliga Instagramprofiler via RSSHub.

Detta är en enanvändarpilot. Koden använder den befintliga JavaScript-layouten med Vite som byggverktyg. React behövs inte för Firebase eller Vercel och ingår inte i denna version.

## 1. Skapa Firebase-projektet

1. Öppna https://console.firebase.google.com/ och skapa ett separat projekt, exempelvis `lindas-lasrum`. Välj Spark, utan att koppla på fakturering. Google Analytics behövs inte.
2. Under **Build → Authentication → Get started → Sign-in method**, aktivera **Email/Password**. Aktivera inte mejllänk som inloggningssätt.
3. Under **Build → Firestore Database**, skapa databasen **(default)** i **Standard edition**, med **Production mode**. Välj en lämplig europeisk region. Regionen kan inte enkelt ändras efteråt.
4. Under **Project settings → General → Your apps**, registrera en **webbapp**. Kopiera webbkonfigurationens `apiKey`, `authDomain`, `projectId` och `appId`. Firebase Hosting behövs inte.

Firebase kräver en mejlformad identifierare för lösenordsinloggning. Vi använder `linda@lasrum.invalid` internt, och visar bara användarnamnet `linda` i appen. Det är ingen brevlåda. Återställning via mejl fungerar därför inte. Vid glömt lösenord kan du använda initieringsprogrammet med återställningsflaggan nedan, utan mejl.

## 2. Hämta projektet till datorn

Installera Node.js 24 LTS och Git om de saknas. Öppna terminalen, exempelvis PowerShell i Windows:

```powershell
git clone https://github.com/novia-linda/materialbank.git
cd materialbank/lasrum
npm ci
npm --prefix tools ci --ignore-scripts
```

Alla följande kommandon körs från mappen `materialbank/lasrum`.

## 3. Publicera databasreglerna

```powershell
npx firebase login
npx firebase deploy --only firestore:rules --project DITT-FIREBASE-PROJEKT-ID
```

Ersätt `DITT-FIREBASE-PROJEKT-ID` med projektets exakta ID. Kommandot lägger in `firestore.rules` från detta projekt. Behåll inte testregler som tillåter alla att läsa och skriva.

Reglerna kräver både Firebase-inloggning och en administrativt skapad ägarpost. Att någon lyckas skapa ett annat Firebase-konto ger därför inte åtkomst. Ägarlistan och flödesinnehållet kan inte ändras av webbläsarkoden.

## 4. Skapa ditt konto och lägg in startmaterialet

1. I Firebase: **Project settings → Service accounts → Generate new private key**.
2. Spara JSON-filen utanför GitHub-mappen, exempelvis i en privat mapp på datorn. Den ger administrativ åtkomst: lägg den aldrig i GitHub eller Vercels `VITE_`-variabler och klistra inte in den i en chatt.
3. Ange sökvägen och starta initieringen:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Privat\firebase-service-account.json"
node tools/setup.mjs
```

På macOS/Linux:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Privat/firebase-service-account.json"
node tools/setup.mjs
```

Välj ditt lösenord när programmet frågar. Det visas inte när du skriver. Använd minst 12 tecken.

Programmet skapar kontot, ägarposten, dina grundinställningar och pilotens 79 inlägg från sex källor. Om kontot redan finns behålls dess lösenord. Befintliga inställningar och anteckningar ersätts inte. Startmaterialet initieras bara när `meta/seed` saknas; undvik att radera den posten.

Om du senare vill byta lösenord, ange nyckelsökvägen som ovan och kör i PowerShell:

```powershell
$env:RESET_PASSWORD="1"
node tools/setup.mjs
Remove-Item Env:RESET_PASSWORD
```

På macOS/Linux: `RESET_PASSWORD=1 node tools/setup.mjs`. Du får välja ett nytt lösenord; kontots UID och sparade uppgifter behålls.

Har du redan favoriter eller anteckningar i den gamla piloten? Exportera där via **… → Säkerhetskopia**. När den nya appen fungerar kan du importera filen där. Det ersätter ditt nya kontos personliga markeringar och inställningar.

## 5. Koppla Vercel till GitHub

1. Öppna https://vercel.com/new och välj ditt personliga Hobby-konto för detta privata hobbyprojekt.
2. Importera **novia-linda/materialbank**.
3. Välj **Root Directory: `lasrum`**. Det är viktigt: resten av materialbanken ska inte bli appens rot.
4. Framework: **Vite**. Build command: `npm run build`. Output directory: `dist`. Install command: `npm ci`.
5. Lägg in följande Environment Variables för Production. Om du vill prova Preview ska samma variabler finnas där också:

| Namn | Värde |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` från webbkonfigurationen |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` från webbkonfigurationen |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` från webbkonfigurationen |
| `VITE_FIREBASE_APP_ID` | `appId` från webbkonfigurationen |
| `VITE_LOGIN_USERNAME` | `linda` |
| `VITE_LOGIN_EMAIL` | `linda@lasrum.invalid` |

Webbkonfigurationen är avsedd att hamna i webbläsaren. Den är inte administratörsnyckeln och skyddar inte databasen; det gör Authentication och Firestore-reglerna.

6. Välj **Deploy**.
7. Kopiera appens slutliga domän, exempelvis `lindas-lasrum.vercel.app`. I Firebase: **Authentication → Settings → Authorized domains → Add domain**. Lägg till just den domänen, utan `https://` eller sökväg. Lägg även till `localhost` om du vill testa lokalt.
8. Öppna Vercel-adressen och logga in med `linda` och lösenordet du valde.

Ändrar du Vercels miljövariabler behöver du göra en ny deployment. På iPhone: öppna sidan i Safari och välj **Dela → Lägg till på hemskärmen**. Det är en webbapp; ingen App Store behövs.

## 6. Aktivera automatisk hämtning

Workflow-filen hör hemma på repositorynivå, inte inne i appmappen:

```text
materialbank/.github/workflows/lasrum-refresh.yml
```

Den medföljande kopian finns också i `lasrum/workflows/lasrum-refresh.yml`. Om filen redan finns på rätt plats behöver du inte kopiera den igen.

1. I GitHub-repot: **Settings → Secrets and variables → Actions → New repository secret**.
2. Namn: **`FIREBASE_SERVICE_ACCOUNT`**.
3. Värde: hela innehållet i din privata service account-JSON. Spara det endast som en secret, aldrig som en vanlig repositoryfil eller variabel.
4. Under **Actions**, aktivera workflows om GitHub frågar. Välj **Läsrum – hämta källor → Run workflow** för första körningen.
5. Öppna appen på nytt och kontrollera **Källor → …** för respektive källa. En grön workflow betyder att jobbet genomförts; enskilda källor kan fortfarande ha felstatus.

Jobbet körs normalt en gång per dygn kl. 13.37 UTC: cirka 15.37 finsk vintertid och 16.37 sommartid. GitHub kan fördröja schemalagda jobb. Saknas nyckeln hoppas hämtningen över. I offentliga repos kan schemalagda workflows stängas av efter 60 dagar utan repositoryaktivitet; kontrollera Actions och aktivera igen vid behov.

Hämtningen körs på GitHub, även när telefonen är avstängd. Ingen AI-modell anropas och inga AI-krediter används. Vercel visar sidan; Firebase läser och sparar databasinnehåll.

## 7. Så lägger du till nya källor

Öppna **Källor → Lägg till**, välj namn, URL och kategori. Spara och vänta på nästa hämtning, eller kör workflow manuellt.

| Källa | Vilken länk du anger |
| --- | --- |
| Instagram | Offentlig profillänk, exempelvis `https://www.instagram.com/kontonamn/` |
| YouTube-kanal | Kanalens `https://www.youtube.com/channel/UC…`-adress. `@namn` behöver först översättas till kanal-ID. Wesley Annas ID finns redan i startmaterialet. |
| YouTube-spellista | Länk med `playlist?list=…` |
| Substack | Publikationens `https://namn.substack.com/`, inte en personlig `substack.com/@…`-profil |
| Podd | Direkt RSS-adress, inte Apple- eller Spotify-länken |
| Annan webbplats | Dess direkta RSS-/Atom-adress |

Instagram är fortfarande beroende av RSSHub och Instagrams ändringar. Ett lyckat tidigare test garanterar inte att GitHubs servrar kan hämta varje konto varje dag. Inga Instagramlösenord eller sessionscookies används. Nya Instagraminlägg utan tillgänglig bildmetadata får en omslagsruta; de befintliga 69 omslagsbilderna följer med. Originalvideor lagras aldrig i appen. Instagram öppnas via originallänken; den nya versionen lovar ingen egen Instagramspelare.

YouTube- och Substack-flöden som tidigare misslyckades provas igen i driftsmiljön. De manuella exemplen finns kvar, men räknas inte som verifierat automatiskt hämtade.

Det allmänna flödet behåller högst 150 inlägg per aktiv källa efter hämtning. Favoriter/anteckningar sparar egna kopior av inläggets text och länkar. Äldre sådana poster kan finnas kvar i Bibliotek även om källan tas bort. Befintliga inlägg raderas inte automatiskt när en källa tas bort.

## Kostnad och gränser

Upplägget är avsett för Vercel Hobby och Firebase Spark, inom respektive gratiskvoter. Ingen Firebase Cloud Function, Cloud Scheduler, Firebase Storage eller AI-tjänst används. Hämtningsjobbet använder GitHub Actions; håll det på standard Linux-runner och kontrollera ditt kontos aktuella villkor och förbrukning.

Firestore Standard har vid kontrollen 1 GiB lagring, 50 000 dokumentläsningar och 20 000 skrivningar per dygn i gratiskvoten. Varje sidstart läser flödet och dina markeringar; ett klick skriver normalt bara de poster som ändrats. Regelkontroller kan också ge läsningar. För en person med några källor är detta ett rimligt gratisupplägg, ingen garanti för all framtida användning. Aktivera inte Blaze för denna pilot.

Appens pilotgränser är 100 källor, 100 ämnen, 500 etiketter och 20 000 tecken per anteckning. Den är byggd för ett personligt urval, inte ett arkiv med obegränsat antal konton.

## Kontrollera innan du börjar använda den

- Logga in och växla mellan Hem, Flöde och ljust/mörkt.
- Favoritmarkera ett inlägg, skriv en anteckning med `#prova` och kvittera ett annat.
- Vänta tills statusen visar **Sparat i Firebase**.
- Öppna på en annan enhet eller i ett nytt webbläsarfönster, logga in och kontrollera att uppgifterna finns kvar.
- Logga ut och kontrollera att innehållet döljs.
- Kör hämtningen manuellt och granska varje källas status.
- Prova export och återställning med en säkerhetskopia.

Molnsparandet sker när du ändrar något. Vid fel visas en varning och en knapp för att försöka igen. Stäng inte sidan med osparade ändringar. Denna version har ingen hållbar offlinekö. Ändringar från en annan enhet hämtas vid omladdning; samtidig redigering av samma uppgift kan skriva över den senaste versionen.

Koden och de offentliga startlänkarna ligger i ditt offentliga materialbank-repo. Dina lösenord, favoriter och anteckningar ska endast ligga i Firebase. Appen är inte avsedd som skyddad dagbok för känsligt innehåll. Exporterade säkerhetskopior är okrypterade.

## Om något inte fungerar

**”Firebase är inte konfigurerat”:** kontrollera alla sex Vercel-variabler och gör Redeploy.

**Inloggning misslyckas:** kontrollera Email/Password-provider, användarnamn, internt mejl-ID och lösenord i Authentication. Kontrollera appens domän.

**Kontot saknar åtkomst/databasen är inte färdig:** kontrollera att setup körts i samma projekt som Vercel använder, att `access/DITT-UID` finns och att reglerna publicerats.

**”Kunde inte spara”:** håll sidan öppen, kontrollera nätet och välj Försök spara igen. Kontrollera Firestore-regler och Usage i Firebase.

**En källa uppdateras inte:** läs dess status under Källor. Kontrollera sedan senaste Actions-körningen. En plattformsförändring kan kräva att RSSHub uppdateras och testas igen.

## Källor för installation och villkor

Kontrollerade 9 november 2026:

- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/environment-variables/managing-environment-variables
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/admin/setup
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/pricing/
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
