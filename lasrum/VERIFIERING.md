# Leveransstatus

Den ursprungliga enanvändarversionen byggdes och fick sina fyra modelltester samt fyra Firestore-regeltester godkända före arbetet med Google-inloggning och admin.

Den senaste ändringen ger varje konto egna Firestore-dokument, Google-inloggning och en adminvy för att godkänna eller avslå gäster. Den här utökningen är ännu inte byggd eller provad mot ett Firebase-projekt. Konfigurera först Firebase och Vercel enligt [STARTA-HAR.md](STARTA-HAR.md). Då kan du kontrollera adminuppstart, godkännande, avskildhet mellan två konton och källhämtning.

Regeltesterna i `tests/rules.spec.js` har uppdaterats för den nya godkännandemodellen. Kör lokalt `npm test`, `npm run test:rules` och `npm run build` efter Firebase/Vercel-konfiguration. Regeltesterna använder emulatorn, testprojektet `demo-lasrum` och ingen produktionsdatabas.
