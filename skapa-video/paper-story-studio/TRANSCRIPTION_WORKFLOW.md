# Paper Story Studio — transkribering och textöverlägg

## Från inspelning till filmtext

1. Öppna projektet (t.ex. `PROJ-00140`) och välj **iPhone-läge → Bara ljud** (förvalt läge). Läs telepromptern och svep mellan meningarna. Inspelningen får exakta bildbytes- och stödtextstämplar.
2. Granska inspelningen. Tryck **Spara inspelningen för talanalys**. Den här uppladdningen kräver GitHub-PAT med Contents: Read and write.
3. Appen laddar upp **en komprimerad ljudfil**, plus `project.json` med bildbyten och tidpunkter. Originalinspelningarna sparas som separata tagningar och kan klippas utan att originalet förstörs. Kameravideo är ett frivilligt separat läge; vi prioriterar ljud för att hålla oss inom GitHubs filgränser.
4. En GitHub Actions-körning startar när `project.json` **eller en ny ljud-/videofil under `media/`** läggs upp. Den skapar/uppdaterar `transcript.json` med svensk transkription och ungefärliga ordtidsstämplar. Detta använder `faster-whisper` på GitHub-runnern; ingen AI-API-nyckel behövs. Även ljud som laddats upp utan projektmetadata kan återfinnas och transkriberas.
5. Gå till **Förhandsvisa → Text på filmen** och tryck **Hämta talanalys**. Klicka på ord ur talanalysen eller skriv egna korta fraser. Du kan ändra start/slut, storlek, animation och dra texten på förhandsvisningen.
6. Tryck **Spara text och projekt till GitHub**. Textöverläggen sparas i `words.json`.

Filerna har olika roller och får inte blandas ihop:
- `project.json`: scener, media, tagningar, svephändelser och klipplista.
- `media/`: originalvideo och ljudspår.
- `transcript.json`: maskinellt framräknade ord med tidpunkter i **respektive originaltagning**.
- `words.json`: färdiga kreativa textöverlägg i **den redigerade filmens tidslinje**. Ändras inte av transkriberingsjobbet.

Om GitHub Actions inte kör automatiskt, gå till **Actions → Paper Story - tal till tidsstampel → Run workflow**, välj projekt-ID. Kontrollera att workflow permissions tillåter `contents: write` i repository-inställningarna.

### När du vill ha hjälp av ChatGPT
Säg till exempel:

> Öppna Paper Story-projekt PROJ-00140, läs project.json, transcript.json och words.json. Välj 5–8 pedagogiskt viktiga ord eller korta fraser som passar berättelsen och skapa snyggt tidsstämplade överlägg i words.json. Behåll mina redan manuellt skapade textöverlägg och den befintliga pappersstilen.

ChatGPT behöver beakta `project.edits` (vilka delar av varje tagning som finns med) och `takes[].events` (bild- och sveptider), så att ordens tidsstämplar översätts från tagningstid till färdig filmtid.

### Prioritet: ljud först
- På iPhone använder inspelningsläget bara mikrofonen som standard. Pappersbilden och telepromptern får mer plats; ingen kameravideo lagras i ljudläget.
- Ljudet kodas med målbithastighet cirka 64 kbit/s, så filerna blir små. Appens GitHub-uppladdning tillåter maximalt 35 MB per mediefil och ljudinspelningen försöker avslutas före 24 MB.
- Förhandsvisningen har en spelare för originalrösten och en knapp **Spara ljud**. Det stora bildfönstret på mobil kan scrollas utan att krympa till en miniatyr.
- För nya ljudinspelningar styr dina **verkliga sveptider** bildtidslinjen. För äldre inspelningar utan sparade sveptider, som PROJ-00140, måste bildbytena anpassas ungefärligt.
- Videoexport från ett projekt med bara ljud är avsiktligt spärrad just nu, så att appen inte erbjuder en tyst slutfilm av misstag. Videoexport blir nästa separat kvalitetssäkrade steg.

### Viktigt
- Den automatiska transkriberingen är en första uppskattning. Kontrollera ord och tidpunkter, särskilt efter omtagningar, pauser och tal i bakgrunden.
- Om `novia-linda/materialbank` används är inspelningarna och transkriptionen offentligt tillgängliga.
- Den automatiska bearbetningen sker på GitHub, inte inne i ChatGPT. ChatGPT kan analysera den genererade transkriptionen när du ber om det.

## Status och delvis sparad inspelning

I Förhandsvisa finns nu statusen **Inspelning → Talanalys → Text på filmen** och knappen **Kontrollera talanalys**. Projekt- och inspelningsmetadata sparas före `words.json`; en konflikt i textöverläggen stoppar inte längre projektfilen. Om en mediafil inte kunde laddas upp visas en varning och den behålls i den lokala säkerhetskopian.

**PROJ-00140:** Den uppladdade ljudfilen `media/take-voice-mwri92ie-vq9cx.m4a` är återkopplad som berättarröst. GitHub Actions har skapat 369 svenska ord med tidsstämplar i `transcript.json`. Den ursprungliga kameravideon och de exakta svepmarkörerna saknades i GitHub, så bildtidslinjen behöver anpassas manuellt. I Förhandsvisa → Text på filmen finns knappen **Anpassa filmens längd till inspelningen**, som är en grov tidsanpassning, inte en rekonstruktion av svepningar.
