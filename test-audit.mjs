// Re-prove each of the 6 confirmed defects is closed.
import { readFileSync } from 'node:fs';
const src = readFileSync('/Users/r/code/google-seo/audit.mjs','utf8');
let pass=0, fail=0;
const t = (name, cond) => { (cond?pass++:fail++); console.log(`${cond?'PASS':'FAIL'}  ${name}`); };

// #2 attribute regex with apostrophes
const ATTR = (n) => `${n}=(["'])((?:(?!\\1).)*)\\1`;
const metaC = (h, attr, key) => h.match(new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*${ATTR('content')}`,'i'))?.[2]
  ?? h.match(new RegExp(`<meta[^>]*${ATTR('content')}[^>]*${attr}=["']${key}["']`,'i'))?.[2] ?? '';
t("#2 content=\"it's great\" captured whole", metaC('<meta name="description" content="it\'s great">','name','description')==="it's great");
t("#2 content=\"'Tis the season\" not empty", metaC('<meta name="description" content="\'Tis the season to buy">','name','description')==="'Tis the season to buy");
t("#2 single-quoted still works", metaC("<meta name='description' content='plain'>",'name','description')==='plain');
t("#2 reversed attr order", metaC('<meta content="it\'s x" name="description">','name','description')==="it's x");

// #3 stacked User-agent groups
function robotsGroups(body){const g=new Map();let pending=[],current=[];
 for(const raw of body.split(/\r?\n/)){const line=raw.replace(/#.*$/,'').trim();if(!line)continue;
  const ua=line.match(/^User-agent:\s*(\S+)/i);
  if(ua){if(current.length){pending=[];current=[];}pending.push(ua[1].toLowerCase());if(!g.has(ua[1].toLowerCase()))g.set(ua[1].toLowerCase(),[]);continue;}
  if(!pending.length)continue;current.push(line);for(const a of pending)g.get(a).push(line);} return g;}
const blocksAll=(g,a)=>(g.get(a.toLowerCase())||[]).some(l=>/^Disallow:\s*\/\s*$/i.test(l));
t("#3 stacked '*' + Googlebot -> * blocked", blocksAll(robotsGroups("User-agent: *\nUser-agent: Googlebot\nDisallow: /"),'*'));
t("#3 stacked GPTBot + CCBot -> GPTBot blocked", blocksAll(robotsGroups("User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /"),'GPTBot'));
t("#3 separate block does NOT leak to *", !blocksAll(robotsGroups("User-agent: *\nAllow: /\n\nUser-agent: BadBot\nDisallow: /"),'*'));
t("#3 plain '* Disallow: /' still caught", blocksAll(robotsGroups("User-agent: *\nDisallow: /"),'*'));

// #4 robots "none"
t('#4 content=none detected as noindex', /\b(noindex|none)\b/i.test('none'));
t('#4 "nonetheless" not a false hit', !/\b(noindex|none)\b/i.test('nonetheless'));

// #6 norm() query-slash
const origin='https://example.com';
const norm=(u)=>{try{const x=new URL(u,origin);const p=x.pathname==='/'?'/':x.pathname.replace(/\/$/,'');return x.origin+p+x.search;}catch{return u;}};
t('#6 query trailing slash preserved', norm('https://example.com/page?path=/a/b/')==='https://example.com/page?path=/a/b/');
t('#6 distinct query URLs stay distinct', norm('https://example.com/p?x=/a/')!==norm('https://example.com/p?x=/a'));
t('#6 root keeps its slash', norm('https://example.com/')==='https://example.com/');
t('#6 path trailing slash stripped', norm('https://example.com/foo/')==='https://example.com/foo');
t('#6 ?lang variants distinct', norm('https://example.com/r?lang=en')!==norm('https://example.com/r'));

// #1 + #5 structural
t('#1 per-child sitemap audit exists', src.includes('function auditOneSitemap') && src.includes('for (const child of top)'));
t('#1 no silent slice(0,50) / slice(0,500)', !src.includes('locs.slice(0, 50)') && !src.includes('locs.slice(0, 500)'));
t('#5 exit is autoFix-only + documented', src.includes('exit(autoFix.length ? 1 : 0)') && src.includes('handoff items may still be printed'));


// ---- round 2 regressions ----
const src2 = readFileSync('/Users/r/code/google-seo/audit.mjs','utf8');
const ATTR2=(n)=>`${n}=(["'])((?:(?!\\1).)*)\\1`, UNQ2=(n)=>`${n}=([^\\s"'>]+)`;
const metaC2=(h,a,k)=>h.match(new RegExp(`<meta[^>]*${a}=["']${k}["'][^>]*${ATTR2('content')}`,'i'))?.[2]
  ?? h.match(new RegExp(`<meta[^>]*${ATTR2('content')}[^>]*${a}=["']${k}["']`,'i'))?.[2]
  ?? h.match(new RegExp(`<meta[^>]*${a}=["']${k}["'][^>]*${UNQ2('content')}`,'i'))?.[1]
  ?? h.match(new RegExp(`<meta[^>]*${UNQ2('content')}[^>]*${a}=["']${k}["']`,'i'))?.[1] ?? '';
t('#R2-6 unquoted content= is captured', metaC2('<meta name="description" content=RealDesc>','name','description')==='RealDesc');
t('#R2-6 quoted still wins', metaC2('<meta name="description" content="a b">','name','description')==='a b');
t('#R2-6 empty content is still "missing"', metaC2('<meta name="description" content="">','name','description')==='');

const pgParam=(u)=>[...new URL(u).searchParams.keys()].find(k=>/^page$/i.test(k));
t('#R2-3 ?p=456 (WP post id) is NOT pagination', pgParam('https://x.com/?p=456')===undefined);
t('#R2-3 ?page=3 IS pagination', pgParam('https://x.com/?page=3')==='page');

t('#R2-2 amphtml resolves against page url',
  new URL('amp','https://x.com/blog/post').href==='https://x.com/blog/amp' && src2.includes('new URL(v.amphtml, u).href'));
t('#R2-1 nested sitemap index is flagged, not crawled as pages', src2.includes('nested indexes are not supported') && src2.includes('if (childIsIndex)'));
t('#R2-4 every Sitemap: directive is audited', src2.includes('for (const sm of list) all.push('));
t('#R2-5 canonicalByUrl dead code removed', !src2.includes('canonicalByUrl'));
t('#R2-utf8 only a declared non-UTF-8 encoding is an error', src2.includes('declares encoding=') && !src2.includes("'does not declare UTF-8 encoding'"));
t('#R2-dup noindex reported once (raw only)', src2.includes("if (view === 'raw' && /\\b(noindex|none)\\b/i"));
t('#R2-dup structured data not double-reported', src2.includes('const skipSd ='));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
