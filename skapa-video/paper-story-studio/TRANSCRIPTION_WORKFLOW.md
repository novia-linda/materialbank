# Paper Story Studio — transkribering och textöverlägg

## Från inspelning till filmtext

1. Öppna projektet (t.ex. `PROJ-00140`) och spela in i **iPhone-läge**.
2. Granska inspelningen. Tryck **Spara inspelningen för talanalys**. Den här uppladdningen kräver GitHub-PAT med Contents: Read and write.
3. Appen laddar upp originalvideo, eventuellt separat ljud och `project.json` med dina sveptider. Inspelningarna behålls som separata tagningar.
4. En GitHub Actions-körning startar när `project.json` uppdateras och skapar/uppdaterar `transcript.json` med svensk transkription och ungefärliga ordtidsstämplar. Detta använder `faster-whisper` på GitHub-runnern; ingen AI-API-nyckel behövs.
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

### Viktigt
- Den automatiska transkriberingen är en första uppskattning. Kontrollera ord och tidpunkter, särskilt efter omtagningar, pauser och tal i bakgrunden.
- Om `novia-linda/materialbank` används är inspelningarna och transkriptionen offentligt tillgängliga.
- Den automatiska bearbetningen sker på GitHub, inte inne i ChatGPT. ChatGPT kan analysera den genererade transkriptionen när du ber om det.
