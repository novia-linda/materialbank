export const keyFor = id => Array.from(new TextEncoder().encode(id),b=>b.toString(16).padStart(2,'0')).join('');
export function records(state){
 const {marks={},archives={},...settings}=state;
 const docs=new Map([['settings/main',settings]]);
 for(const id of new Set([...Object.keys(marks),...Object.keys(archives)])){
  if(new TextEncoder().encode(id).length>700)throw Error('Ett inlägg har ett för långt ID för att sparas.');
  const mark={read:false,favorite:false,note:'',tags:[],...marks[id]};
  if(mark.note.length>20000||mark.tags.length>100)throw Error('Anteckningen eller etikettlistan är för lång.');
  docs.set('marks/'+keyFor(id),{itemId:id,mark,archive:archives[id]||{}});
 }
 if(settings.sources.length>100||settings.tags.length>500||settings.categories.length>100)throw Error('Pilotens gräns: 100 källor, 100 ämnen och 500 etiketter.');
 return new Map([...docs].map(([key,data])=>[key,JSON.stringify(data)]));
}
export function difference(before,after){return [...new Set([...before.keys(),...after.keys()])].filter(k=>before.get(k)!==after.get(k)).map(key=>({key,json:after.get(key)}));}
