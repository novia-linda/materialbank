import {test} from 'node:test';import assert from 'node:assert/strict';
import {records,difference,keyFor} from '../src/model.js';
import {feedFor,normalize} from '../tools/sources.mjs';
const base=()=>({version:1,theme:'dark',sources:[],categories:[],tags:[],marks:{},archives:{}});
test('only changed records are written, and restore can delete marks',()=>{const a=base(),before=records(a);a.marks['id:/å']={favorite:true};const after=records(a);assert.equal(difference(before,after).length,1);assert(!keyFor('id:/å').includes('/'));assert.equal(difference(after,before)[0].json,undefined);});
test('oversized notes fail before uploading',()=>{const s=base();s.marks.x={note:'x'.repeat(20001)};assert.throws(()=>records(s));});
test('source formats resolve, ambiguous handles explain what to do',()=>{assert.match(feedFor({url:'https://www.youtube.com/playlist?list=abc'}),/playlist_id=abc$/);assert.equal(feedFor({url:'https://abc.substack.com/'}),'https://abc.substack.com/feed');assert.throws(()=>feedFor({url:'https://youtube.com/@abc'}));});
test('stable podcast IDs keep existing favorites and received date',()=>{const old={id:'podcast:g',fetchedAt:'2020-01-01',thumbnail:'media/old.webp'};const i=normalize({id:'podcast',url:'https://example.com',type:'Podd'},{guid:'g',title:'<b>Hej</b>',pubDate:'bad'},'2026-01-01',new Map([[old.id,old]]));assert.equal(i.id,old.id);assert.equal(i.fetchedAt,old.fetchedAt);assert.equal(i.publishedAt,null);assert.equal(i.thumbnail,old.thumbnail);assert.equal(i.title,'Hej');});
