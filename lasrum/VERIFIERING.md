# Verifiering 9 november 2026

- `npm test`: 4 godkända tester. Ändrade dokument, borttagning vid återställning, gränser, källadresser och bevarade podcast-ID:n/datum.
- `npm run test:rules`: 4 godkända tester mot lokal Firestore-emulator. Anonyma och obehöriga konton nekas läsning. Ägaren kan läsa flödet, spara egna markeringar och inställningar. Klienten får inte skriva flödet eller skapa behörigheter. Andra användares data och för långa anteckningar nekas.
- `npm run build`: godkänt Vite-produktionsbygge.
- Syntaxkontroll av gränssnitt och hämtningsprogram: godkänd.
- Startdata: 79 poster, sex källor och 69 matchande optimerade omslagsbilder. Oanvända originalbilder har uteslutits.

Gränssnittet bygger på den tidigare provade HTML/CSS/JavaScript-piloten. Den nya Firebase-inloggningen och hela flödet mellan webbläsare, Vercel, Firebase och GitHub Actions har **inte** provats mot ett verkligt Firebase-projekt, eftersom användarens projekt och nycklar ännu inte har konfigurerats. Produktionskontrollen står i STARTA-HAR.md.

Instagram via RSSHub fungerade i det tidigare separata testet för två offentliga profiler. GitHub-runnerns åtkomst och den schemalagda driften återstår att prova. Tidigare fel för YouTube/Substack behandlas som fel, inte som fungerande automatiska källor.

Bygget ger en storleksvarning för JavaScript-paketet, ungefär 585 kB före komprimering och 177 kB gzip. Detta är inget byggfel. Firebase CLI 14 varnar för att en kommande huvudversion kräver Java 21; testet kördes framgångsrikt med Java 17.
