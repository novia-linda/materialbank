# Lindas läsrum: Google, Firebase och Vercel

Läsrummet låter varje person logga in med Google och få sitt eget flöde. Google-inloggade gäster kan be om tillträde. Linda godkänner varje konto i appens adminvy. Källor, lässtatus, favoriter, anteckningar och etiketter sparas separat för varje person.

## 1. Skapa Firebase-projektet

1. Gå till https://console.firebase.google.com/ och skapa ett projekt, exempelvis `lindas-lasrum`. Välj Spark och koppla inte på fakturering för den här piloten. Analytics behövs inte.
2. Under **Build → Authentication → Get started → Sign-in method** aktiverar du **Google** och väljer ett supportmejl.
3. Under **Build → Firestore Database** skapar du databasen **(default)** i **Standard edition**, med **Production mode**. Välj en europeisk region. Den går inte enkelt att byta senare.
4. Under **Project settings → General → Your apps** registrerar du en webbapp. Spara värdena `apiKey`, `authDomain`, `projectId` och `appId` från Firebase-konfigurationen.

Google används endast för inloggningen. Appen begär inte tillgång till Drive, Gmail eller kontakter, och den skickar inga mejl. Firebase får Googles kontoidentitet, inklusive e-postadress och användar-ID, så att admin kan se vem som ber om tillträde.

## 2. Hämta projektet och publicera reglerna

Installera Node.js 24 LTS och Git. Kör i terminalen, exempelvis PowerShell:

```powershell
git clone https://github.com/novia-linda/materialbank.git
cd materialbank/lasrum
npm ci
npm --prefix tools ci --ignore-scripts
npx firebase login
npx firebase deploy --only firestore:rules --project DITT-FIREBASE-PROJEKT-ID
```

Byt `DITT-FIREBASE-PROJEKT-ID` mot ditt riktiga projekt-ID. Kommandot publicerar appens åtkomstregler. Lämna aldrig Firestore i testläge med öppna regler.

## 3. Publicera webbsidan på Vercel

1. Gå till https://vercel.com/new och välj ditt personliga Hobby-konto.
2. Importera `novia-linda/materialbank`.
3. Ange **Root Directory: `lasrum`**.
4. Välj Vite. Build command: `npm run build`. Output directory: `dist`. Install command: `npm ci`.
5. Lägg in dessa Environment Variables för Production:

| Namn | Värde |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` från Firebase-webbappen |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` från Firebase-webbappen |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` från Firebase-webbappen |
| `VITE_FIREBASE_APP_ID` | `appId` från Firebase-webbappen |

6. Välj **Deploy**.
7. Lägg till Vercel-domänen i Firebase under **Authentication → Settings → Authorized domains**. Ange bara domännamnet, till exempel `lindas-lasrum.vercel.app`.
8. Öppna Vercel-adressen och välj **Fortsätt med Google** med det konto du vill använda som admin. Första gången skickas kontot till vänteläget. Låt fliken vara öppen eller logga ut.

## 4. Gör ditt Google-konto till admin

Firebase behöver skapa ditt Google-inloggningskonto innan det kan få adminrollen. Därför kör du engångsuppstarten från din dator efter första Google-inloggningen.

1. Skapa en privat Firebase Admin-nyckel i Firebase: **Project settings → Service accounts → Generate new private key**.
2. Spara JSON-filen utanför GitHub-mappen. Den ger administrativ åtkomst till Firebase. Lägg den aldrig i GitHub, i Vercels miljövariabler eller i en chatt.
3. I PowerShell, från mappen `materialbank/lasrum`, kör:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Privat\firebase-service-account.json"
node tools/bootstrap-admin.mjs
```

Byt sökvägen till din privata nyckelfil. Skriv in e-postadressen för samma Google-konto du nyss använde i Läsrummet. Terminalen döljer adressen medan du skriver. Skriptet kontrollerar att Firebase-kontot faktiskt har loggat in via Google, ger det adminrollen och skapar dess egna startflöde.

På macOS/Linux:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Privat/firebase-service-account.json"
node tools/bootstrap-admin.mjs
```

Om du har sparat favoriter eller anteckningar i den tidigare statiska piloten kan du exportera dem där via **… → Säkerhetskopia**. När nya Läsrummet är igång kan du importera JSON-filen via samma meny. Importen ersätter då kontots personliga inställningar och markeringar.

Gå tillbaka till Läsrummet och välj **Kontrollera igen**, eller logga ut och in på nytt. Adminpanelen **Hantera åtkomst** ska nu synas. Ta bort nyckelsökvägen från terminalen när du är klar:

```powershell
Remove-Item Env:GOOGLE_APPLICATION_CREDENTIALS
```

## 5. Godkänn kompisar

Be kompisen öppna din Vercel-adress och logga in med Google. Hen hamnar i vänteläget och får ingen åtkomst till flöden eller anteckningar innan du godkänner.

I ditt Läsrum väljer du **Hantera åtkomst**. Du ser namnet och e-postadressen från Googles konto och kan välja **Godkänn** eller **Avvisa**. Vid godkännande skapar appen personens egna inställningar och flöde. Gästen får samma starturval att börja med, och kan sedan lägga till, ta bort och kategorisera egna källor. Personens anteckningar och favoriter är privata för det kontot.

Du behöver inte hantera kompisarnas lösenord eller skicka inbjudningsmejl. Varje person loggar in på Google. Om en användare avslås kan hen inte läsa något innehåll i appen. Länken till webbsidan kan delas; Firebase-reglerna bestämmer vem som kommer in.

## 6. Aktivera daglig hämtning

Workflow-filen ligger redan i GitHub på `.github/workflows/lasrum-refresh.yml`.

1. Öppna repot och välj **Settings → Secrets and variables → Actions → New repository secret**.
2. Namn: `FIREBASE_SERVICE_ACCOUNT`.
3. Värde: hela innehållet i Firebase Admin-nyckelns JSON. Spara den bara som en GitHub Secret.
4. Under **Actions** aktiverar du workflows om GitHub frågar. Välj **Läsrum – hämta källor → Run workflow** för en första körning.
5. Kontrollera appens **Källor**. Hämtningen kör separat för varje godkänt konto.

Jobbet körs normalt en gång per dygn kl. 13.37 UTC, ungefär 15.37 finsk vintertid och 16.37 sommartid. GitHub kan fördröja schemalagda jobb. Saknas nyckeln hoppas hämtningen över. I ett offentligt repo kan GitHub stänga av schemalagda workflows efter 60 dagar utan repositoryaktivitet; kontrollera Actions och aktivera igen vid behov.

När du godkänner en ny kompis får hen ett startflöde direkt. Nästa schemalagda hämtning fyller sedan på personens egna nya inlägg.

## 7. Lägga till källor

I respektive Läsrum öppnar användaren **Källor → Lägg till**. Varje konto har egna källor och kategorier.

| Källa | Länk att ange |
| --- | --- |
| Instagram | Offentlig profillänk, till exempel `https://www.instagram.com/kontonamn/` |
| YouTube-kanal | `https://www.youtube.com/channel/UC…`-länk. En `@namn`-länk måste först översättas till kanal-ID. |
| YouTube-spellista | Länk med `playlist?list=…` |
| Substack | Publikationens `https://namn.substack.com/`-adress |
| Podd | Direkt RSS-adress, inte Apple- eller Spotify-länken |
| Annan webbplats | Direkt RSS- eller Atom-adress |

Instagram bygger på RSSHub och kan sluta fungera om Instagram ändrar sin webbplats. Inga Instagramlösenord eller sessionscookies används. Nya inlägg kan sakna omslagsbild. Befintliga 69 optimerade bilder är med i appen; originalvideor lagras inte. YouTube och Substack som tidigare inte hade fungerande flöden provas igen från GitHub-miljön. Det tidigare testet garanterar inte daglig funktion där.

Varje körning hämtar högst 40 nya poster per källa och behåller högst 150 per källa i varje användares läsrum. Anteckningar och favoriter sparar en egen textkopia av posten. Om en källa tas bort finns redan sparade anteckningar kvar.

## Pris och integritet

Upplägget är tänkt för Vercel Hobby, Firebase Spark och GitHub Actions standardrunner. Det använder inga betalda AI-anrop, Cloud Functions, Cloud Scheduler eller Firebase Storage. Vercel Hobby är avsett för personligt, icke-kommersiellt bruk. Firebase har gratiskvoter, men användning ökar med antalet personer och poster. Granska Usage i Firebase och Actions-förbrukningen när kompisar börjar använda tjänsten. Aktivera inte Blaze utan att först granska eventuell kostnad.

Koden och de offentliga startlänkarna finns i ett offentligt GitHub-repo. Favoriter, anteckningar, källval och teman ligger i användarspecifika Firebase-dokument. Databasen kräver godkänt Google-konto. Exporterade säkerhetskopior är okrypterade; använd inte appen som skyddad dagbok för känsligt innehåll.

## Kontrollera när allt är anslutet

- Logga in med Google som admin och kontrollera att adminpanelen visas.
- Godkänn ett eget testkonto och verifiera att det får ett separat flöde.
- Prova att öppna det andra kontots innehåll från det första kontot; åtkomsten ska nekas.
- Spara en favorit, anteckning och etikett. Logga in igen från en annan enhet och kontrollera att de finns kvar.
- Kör GitHub-workflowen manuellt och kontrollera källornas status i båda kontona.
- Prova **… → Säkerhetskopia** om du vill kunna exportera och återställa personliga data.

Molnsparandet sker när du ändrar något. Om sparandet misslyckas visas en varning; håll sidan öppen och välj **Försök spara igen**. Ändringar på andra enheter syns efter omladdning. Undvik att redigera samma anteckning samtidigt på flera enheter.

## Felsökning

**Google-inloggningen misslyckas:** kontrollera att Google är aktiverat under Firebase Authentication och att Vercel-domänen finns bland godkända domäner.

**Du fastnar i vänteläget:** kör `node tools/bootstrap-admin.mjs` efter att ditt Google-konto har loggat in minst en gång. Därefter väljer du **Kontrollera igen**.

**Ingen adminpanel visas:** kontrollera i Firebase Authentication att e-postadressen i bootstrap-skriptet är samma Google-konto som användes i appen. Logga sedan ut och in igen.

**En kompis ser fortfarande vänteläget:** öppna adminpanelen, godkänn kontot och be kompisen välja **Kontrollera igen**.

**En källa inte uppdateras:** läs källans status i appen och den senaste körningen under GitHub Actions. Plattformens ändringar kan kräva en nyare hämtare.

## Officiella installationskällor

Kontrollerade 9 november 2026:

- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/admin/setup
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/firestore/quotas
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/plans/hobby
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
