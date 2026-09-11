# Metadata och resursmotor

Materialbankens sök-/rekommendationsmotor använder metadata. All metadata för GitHub-sidor ligger i respektive HTML-fils `<head>` som `materialbank:*`-taggar.

Exempel:

```html
<meta name="materialbank:id" content="hitta-farger-ai">
<meta name="materialbank:type" content="guide">
<meta name="materialbank:summary" content="Låt AI hjälpa dig hitta färger som passar ihop.">
<meta name="materialbank:topics" content="visuellt-material,marknadsforing">
<meta name="materialbank:platforms" content="verktygsoberoende">
<meta name="materialbank:level" content="kom-igang">
<meta name="materialbank:intents" content="lara,prova,skapa">
<meta name="materialbank:duration" content="5">
<meta name="materialbank:keywords" content="färger,färgpalett,HEX,logo,design">
<meta name="materialbank:featured" content="true">
<meta name="materialbank:status" content="published">
```

## Externa resurser, t.ex. Novia Video

Videor och andra resurser som inte har en egen HTML-sida i repot läggs i `data/external-resources.json`. Motorn behandlar dem på samma sätt som GitHub-sidor.

Exempel:

```json
{
  "id": "video-exempel-01",
  "type": "video",
  "title": "Kom igång med AI-bilder",
  "summary": "En kort introduktionsvideo.",
  "url": "https://video.novia.fi/EXAKT-LANK-HAR",
  "topics": ["ai-bilder", "visuellt-material"],
  "platforms": ["verktygsoberoende"],
  "level": "kom-igang",
  "intents": ["lara", "forsta"],
  "duration": 4,
  "keywords": ["bildgenerering", "AI-bilder"],
  "featured": false,
  "status": "published",
  "source": "novia-video",
  "format": "video"
}
```

Lägg flera objekt i JSON-listan när fler videor tillkommer.

## Uppdatera katalogen

`build_catalog.py` läser alla HTML-sidor, slår ihop dem med `external-resources.json` och skapar `data/resources.json`. En GitHub Action finns i `.github/workflows/build-catalog.yml` och kör detta automatiskt när metadata eller HTML-filer ändras.

Resurser med `status: draft` finns i katalogen men visas inte i den publika motorn.
