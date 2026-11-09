export const text=v=>String(v||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const http=v=>{try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
export function feedFor(s){
 const u=new URL(s.url),host=u.hostname.replace(/^www\./,'');
 if(s.feed&&http(s.feed))return s.feed;
 if(host==='youtube.com'){
  if(u.searchParams.get('list'))return 'https://www.youtube.com/feeds/videos.xml?playlist_id='+encodeURIComponent(u.searchParams.get('list'));
  const channel=u.pathname.match(/^\/channel\/(UC[\w-]+)/)?.[1];if(channel)return 'https://www.youtube.com/feeds/videos.xml?channel_id='+channel;
  throw Error('Använd YouTubes /channel/UC…-adress eller en spellista.');
 }
 if(host.endsWith('.substack.com'))return u.origin+'/feed';
 if(host==='substack.com')throw Error('Använd publikationens namn.substack.com-adress.');
 if(host==='podcasts.apple.com')throw Error('Använd poddens RSS-adress i stället för Apple-länken.');
 if(!http(s.url))throw Error('Ogiltig RSS-adress.');return s.url;
}
export function normalize(s,p,now,existing){
 const raw=String(p.guid||p.id||p.link||'');if(!raw)throw Error('Inlägget saknar ID.');
 const prefix=s.type==='Instagram'?'instagram':s.type==='Podd'?'podcast':'rss';
 const id=prefix==='podcast'?prefix+':'+raw:prefix+':'+s.id+':'+raw;
 if(Buffer.byteLength(id)>700)throw Error('Inläggets ID är för långt.');
 const old=existing.get(id),url=http(p.link||s.url);if(!url)throw Error('Originallänk saknas.');
 const published=p.isoDate||p.pubDate;
 const item={id,sourceId:s.id,title:text(p.title).slice(0,500)||'Nytt inlägg',description:text(p.contentSnippet||p.summary||p.content||p.description).slice(0,1200),url,publishedAt:Number.isNaN(Date.parse(published))?null:new Date(published).toISOString(),fetchedAt:old?.fetchedAt||now,kind:s.type==='Instagram'?'instagram':s.type==='Podd'?'episode':'article'};
 if(old?.thumbnail)item.thumbnail=old.thumbnail;
 else{const htmlThumb=String(p.description||p.content||'').match(/<img[^>]+src=["']([^"']+)/i)?.[1]?.replace(/&amp;/g,'&');const thumb=http(p['media:thumbnail']?.$?.url||p.itunes?.image||htmlThumb);if(thumb)item.thumbnail=thumb;}
 if(p.enclosure?.url&&p.enclosure?.type?.startsWith('audio/'))item.audio=http(p.enclosure.url);
 const video=new URL(url).searchParams.get('v');if(s.type==='YouTube'&&/^[\w-]{11}$/.test(video||'')){item.videoId=video;item.thumbnail='https://i.ytimg.com/vi/'+video+'/hqdefault.jpg';}
 return item;
}
