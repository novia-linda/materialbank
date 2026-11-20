# GitHub Bildbibliotek – webbapp v0.4

Denna version publiceras på GitHub Pages från en mapp i `novia-linda/materialbank`. Bilderna redigeras lokalt i Chrome/Edge och publiceras först när du väljer **Publicera bilder + logg**.

## Kort installation

1. Om Pages inte är aktiverat: GitHub → `novia-linda/materialbank` → **Settings → Pages** → **Deploy from a branch**, `main` och `/(root)` → **Save**.
2. Öppna: **https://novia-linda.github.io/materialbank/bildbibliotek-app/**.
3. Välj **Installera app** (eller Chrome-menyn → Spara och dela → Installera sidan som app) och fäst den i aktivitetsfältet.
4. Skapa en **fine-grained personal access token** på GitHub med **Only select repositories → materialbank** och **Contents: Read and write**.
5. Öppna appen och välj **Anslut till GitHub**. Chrome kan erbjuda att spara åtkomstnyckeln i lösenordshanteraren; om inte, lägg in uppgiften manuellt i Google Password Manager för appens HTTPS-adress.
6. Skärmbild med **Win + Shift + S** → **Ctrl + V** i appen → markera, beskär → godkänn offentlig uppladdning → **Publicera bilder + logg**.

> GitHub Pages-inställningen kan behöva göras manuellt. Kodfilerna är uppladdade, men en faktisk publicerad HTTPS-adress ska inte betraktas som verifierad innan den går att öppna.

## Säkerhet

- Appen laddar inga skärmbilder till en server förrän du klickar **Publicera**.
- Inget GitHub-token lagras av appen i localStorage, cookies, repo, loggfiler eller service worker. Det finns i minnet/formuläret under sessionen. Chrome kan spara det separat i sin lösenordshanterare om du väljer detta.
- Den offentliga webbappen har ingen serversession och ingen extra PIN. Lås Windows med Win + L när du lämnar datorn.
- Offline-cache innehåller bara statiska HTML/CSS/JS- och ikonfiler, aldrig bilder, GitHub-API-svar eller tokens.
- Bilder och loggar laddas upp i det offentliga repot. Maskera personuppgifter på bilderna före publicering. Redigerbara projektfiler kan innehålla originalet och bör förbli lokala.
- GitHub Pages-inställningar, Chrome-autofyllning och GitHub API-anslutning påverkas av organisationens IT-policy.

## Projektet

Filerna består av `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js`, ikoner och `.nojekyll`. Ingen byggkedja, Python eller administratörsinstallation behövs.
