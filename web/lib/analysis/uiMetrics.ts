export type Tokens = {
  color: Record<string,string>
  radius: Record<string,number>
  space: Record<string,number>
  fontSize: Record<string,number>
}
export type Elm = { id:string; x:number; y:number; w?:number; h?:number; type?:string; componentId?:string; propValues?:Record<string,any> }
export type CanvasSize = { width:number; height:number }
export type Metric = { key:string; score:number; detail?:any }
export type Issue = { key:string; level:'info'|'warn'|'error'; message:string; nodeId?:string }
export type AuditResult = { score:number; metrics:Metric[]; issues:Issue[] }

function hexToRgb(h:string){const m=h.replace('#','');const b=m.length===3?[m[0]+m[0],m[1]+m[1],m[2]+m[2]]:[m.slice(0,2),m.slice(2,4),m.slice(4,6)];return {r:parseInt(b[0],16),g:parseInt(b[1],16),b:parseInt(b[2],16)}}
function relLum(hex:string){const {r,g,b}=hexToRgb(hex);const c=[r,g,b].map(v=>{const s=v/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4)});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]}
function contrast(a:string,b:string){const L1=relLum(a),L2=relLum(b);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05)}
function near(a:number,b:number,t=1){return Math.abs(a-b)<=t}
function pick<T>(arr:T[], fn:(x:T)=>boolean){const r: T[]=[];for(const x of arr){if(fn(x))r.push(x)}return r}
function distinct<T>(arr:T[], key:(x:T)=>string){const s=new Set<string>();const out:T[]=[];for(const x of arr){const k=key(x);if(!s.has(k)){s.add(k);out.push(x)}}return out}
function area(el:Elm){return Math.max(1,(el.w||0))*Math.max(1,(el.h||0))}
function getVal(v:any){return typeof v==='string'?v:typeof v==='number'?String(v):''}
function tokenToCss(t:string){if(!t.startsWith('token:'))return t;const k=t.slice(6).replace(/\./g,'-');return `var(--${k})`}
function resolveColor(v:any,tokens:Tokens){const s=getVal(v);if(s.startsWith('token:')){const [,g,k]=s.match(/^token:(\w+)\.(.+)$/)||[];const hex=(tokens as any)[g]?.[k];return typeof hex==='string'?hex:'#000000'}if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s))return s;return tokens.color?.text||'#ffffff'}
function resolveNum(v:any,tokens:Tokens,group:keyof Tokens){if(typeof v==='number')return v;if(typeof v==='string'&&v.startsWith('token:')){const [,g,k]=v.match(/^token:(\w+)\.(.+)$/)||[];const n=(tokens as any)[g]?.[k];return typeof n==='number'?n:0}if(typeof v==='string'&&/^\d+(\.\d+)?(px)?$/.test(v))return parseFloat(v);return 0}
function onScale(n:number,vals:number[],tol=2){return vals.some(v=>near(n,v,tol))}
function modGrid(n:number,base:number,tol=1){const m=n%base;return near(m,0,tol)||near(m,base,tol)}

function isButton(el:Elm){const k=(el.componentId||'').toLowerCase();return k.includes('button')}
function isText(el:Elm){const k=(el.componentId||'').toLowerCase();return k.includes('text')||k.includes('header')}
function getBg(el:Elm,tokens:Tokens){const v=el.propValues?.bg??(el.componentId?.toLowerCase().includes('card')?'token:color.surface':'token:color.bg');return resolveColor(v,tokens)}
function getTextColor(el:Elm,tokens:Tokens){const v=el.propValues?.color??'token:color.text';return resolveColor(v,tokens)}
function getFontSize(el:Elm,tokens:Tokens){const v=el.propValues?.size??'token:fontSize.base';return resolveNum(v,tokens,'fontSize')}
function getRadius(el:Elm,tokens:Tokens){const v=el.propValues?.radius??'token:radius.md';return resolveNum(v,tokens,'radius')}

export function audit(elements:Elm[], tokens:Tokens, canvas:CanvasSize):AuditResult{
  const issues:Issue[]=[]
  const colorPixels:Record<string,number>={}
  const colorOf=(hex:string)=>hex.toLowerCase()
  for(const el of elements){const bg=getBg(el,tokens);const a=area(el);colorPixels[colorOf(bg)]=(colorPixels[colorOf(bg)]||0)+a}
  const totalArea=canvas.width*canvas.height
  const sortedColors=Object.entries(colorPixels).sort((a,b)=>b[1]-a[1])
  const top=sortedColors.slice(0,3).map(([hex,pix])=>({hex,ratio:pix/Math.max(1,totalArea)}))
  const ratioScore=top.length>=3?scoreRange(top[0].ratio,0.55,0.65)*0.4+scoreRange(top[1].ratio,0.25,0.35)*0.35+scoreRange(top[2].ratio,0.05,0.15)*0.25:0
  if(top.length>=3){if(top[0].ratio<0.4||top[0].ratio>0.75)issues.push({key:'color-ratio',level:'warn',message:'配色比率が偏っています'})}

  let textOk=0,textAll=0
  for(const el of elements){if(isText(el)||isButton(el)){textAll++;const bg=getBg(el,tokens);const fg=getTextColor(el,tokens);const cr=contrast(fg,bg);if(cr>=4.5)textOk++;else issues.push({key:'contrast',level:'error',message:`コントラスト不足 ${cr.toFixed(2)}:1`,nodeId:el.id})}}
  const contrastScore=textAll?textOk/textAll:1

  const xs=elements.map(e=>[e.x,(e.x+(e.w||0))/2,(e.x+(e.w||0))]).flat()
  const ys=elements.map(e=>[e.y,(e.y+(e.h||0))/2,(e.y+(e.h||0))]).flat()
  const alignScore=alignmentScore(xs,2)*0.5+alignmentScore(ys,2)*0.5

  const gridBase=nearestBase(Object.values(tokens.space))
  const gridHits=elements.flatMap(e=>[e.x,(e.x+(e.w||0)),e.y,(e.y+(e.h||0))].map(v=>modGrid(Math.round(v),gridBase,1)))
  const gridScore=gridHits.length?gridHits.filter(Boolean).length/gridHits.length:1
  if(gridScore<0.7)issues.push({key:'grid',level:'warn',message:'グリッド準拠率が低いです'})

  const spaces=verticalGaps(elements)
  const spaceVals=Object.values(tokens.space).sort((a,b)=>a-b)
  const spaceOn=spaces.filter(g=>onScale(g,spaceVals,2)).length
  const spaceScore=spaces.length?spaceOn/spaces.length:1
  if(spaceScore<0.7)issues.push({key:'space',level:'warn',message:'余白スケールの一貫性が低いです'})

  const fontVals=Object.values(tokens.fontSize).sort((a,b)=>a-b)
  const fontUsed=elements.filter(isText).map(e=>getFontSize(e,tokens))
  const fontOn=fontUsed.filter(s=>onScale(s,fontVals,1)).length
  const fontScore=fontUsed.length?fontOn/fontUsed.length:1

  const covered=Math.min(1,elements.reduce((s,e)=>s+area(e),0)/Math.max(1,totalArea))
  const densityScore=scoreRange(covered,0.25,0.6)
  if(covered<0.15)issues.push({key:'density',level:'info',message:'要素が少なく間延びしています'})
  if(covered>0.75)issues.push({key:'density',level:'warn',message:'要素が過密です'})

  const inter=elements.filter(isButton)
  const hitOk=inter.filter(e=>(e.w||0)>=44&&(e.h||0)>=44).length
  const hitScore=inter.length?hitOk/inter.length:1
  if(hitScore<1)issues.push({key:'hit',level:'warn',message:'タップ領域が小さい要素があります'})

  const rVals=Object.values(tokens.radius).sort((a,b)=>a-b)
  const rUsed=elements.filter(e=>isButton(e)||(e.componentId||'').toLowerCase().includes('card')).map(e=>getRadius(e,tokens))
  const rOn=rUsed.filter(r=>onScale(r,rVals,1)).length
  const radiusScore=rUsed.length?rOn/rUsed.length:1

  const primaryHex=tokens.color.primary||'#0000ff'
  const primaryBtns=inter.filter(e=>resolveColor(e.propValues?.bg||'',tokens).toLowerCase()===primaryHex.toLowerCase())
  const ctaOk=primaryBtns.length>=1&&primaryBtns.length<=2
  let ctaContrastOk=true
  for(const b of primaryBtns){const cr=contrast(getTextColor(b,tokens),getBg(b,tokens));if(cr<4.5)ctaContrastOk=false}
  const ctaScore=(ctaOk?0.6:0)+(ctaContrastOk?0.4:0)
  if(!ctaOk)issues.push({key:'cta',level:'info',message:'プライマリCTAは1〜2件に絞ると効果的です'})
  if(!ctaContrastOk)issues.push({key:'cta',level:'warn',message:'プライマリCTAのコントラストが不足しています'})

  const usedColors=distinct(Object.keys(colorPixels),k=>k)
  const chromaCount=usedColors.length
  const colorCountScore=chromaCount<=4?1:chromaCount<=6?0.7:0.4
  if(chromaCount>6)issues.push({key:'color-count',level:'info',message:`色数が多いです (${chromaCount})`})

  const groups=cluster(elements,16)
  const intra=groups.reduce((s,g)=>s+avgIntraDist(g),0)/Math.max(1,groups.length)
  const interDist=avgInterDist(groups)
  const groupingScore=interDist>intra?1:0.6

  const metrics:Metric[]=[
    {key:'color-ratio',score:ratioScore,detail:top},
    {key:'contrast',score:contrastScore},
    {key:'alignment',score:alignScore},
    {key:'grid',score:gridScore},
    {key:'space',score:spaceScore},
    {key:'font',score:fontScore},
    {key:'density',score:densityScore,detail:{covered}},
    {key:'hit',score:hitScore},
    {key:'radius',score:radiusScore},
    {key:'cta',score:ctaScore},
    {key:'color-count',score:colorCountScore,detail:{colors:usedColors}},
    {key:'grouping',score:groupingScore}
  ]
  const weights:Record<string,number>={ 'color-ratio':0.10,'contrast':0.15,'alignment':0.10,'grid':0.10,'space':0.10,'font':0.08,'density':0.07,'hit':0.08,'radius':0.05,'cta':0.07,'color-count':0.05,'grouping':0.05 }
  const score=Math.max(0,Math.min(1,metrics.reduce((s,m)=>s+(weights[m.key]||0)*m.score,0)))
  return { score, metrics, issues }
}

function scoreRange(x:number,min:number,max:number){if(x<min)return Math.max(0,1-(min-x)/min);if(x>max)return Math.max(0,1-(x-max)/(1-max));return 1}
function alignmentScore(vals:number[],tol:number){const sorted=vals.slice().sort((a,b)=>a-b);let aligned=0;let i=0;while(i<sorted.length){let j=i+1;while(j<sorted.length&&Math.abs(sorted[j]-sorted[i])<=tol)j++;const cnt=j-i;if(cnt>=2)aligned+=cnt;i=j}return aligned/Math.max(1,sorted.length)}
function verticalGaps(els:Elm[]){const s=els.slice().sort((a,b)=>a.y-b.y);const gaps:number[]=[];for(let i=1;i<s.length;i++){const prev=s[i-1],cur=s[i];const overlapX=Math.min((prev.x+(prev.w||0)),(cur.x+(cur.w||0)))-Math.max(prev.x,cur.x);if(overlapX>0){const g=cur.y-(prev.y+(prev.h||0));if(g>0)gaps.push(g)}}return gaps}
function nearestBase(vals:number[]){const v=vals.slice().sort((a,b)=>a-b);if(!v.length)return 8;const diffs=v.slice(1).map((x,i)=>x-v[i]);const d=diffs.length?median(diffs):v[0];return Math.max(2,Math.round(d))}
function median(a:number[]){const s=a.slice().sort((x,y)=>x-y);const n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2}
function center(el:Elm){return {cx:(el.x+(el.w||0)/2),cy:(el.y+(el.h||0)/2)}}
function dist(a:{cx:number;cy:number},b:{cx:number;cy:number}){const dx=a.cx-b.cx,dy=a.cy-b.cy;return Math.hypot(dx,dy)}
function cluster(els:Elm[],thr:number){const pts=els.map(e=>({id:e.id,...center(e)}));const used=new Set<string>();const groups:string[][]=[];for(let i=0;i<pts.length;i++){if(used.has(pts[i].id))continue;const g=[pts[i].id];used.add(pts[i].id);for(let j=i+1;j<pts.length;j++){if(used.has(pts[j].id))continue;const d=dist(pts[i],pts[j]);if(d<=thr){g.push(pts[j].id);used.add(pts[j].id)}}groups.push(g)}return groups.map(g=>g.map(id=>els.find(e=>e.id===id)!))}
function avgIntraDist(g:Elm[]){if(g.length<2)return 0;let s=0,c=0;for(let i=0;i<g.length;i++){for(let j=i+1;j<g.length;j++){s+=dist(center(g[i]),center(g[j]));c++}}return s/Math.max(1,c)}
function avgInterDist(groups:Elm[][]){if(groups.length<2)return 9999;let s=0,c=0;const cs=groups.map(g=>{const xs=g.map(e=>center(e));return {cx:xs.reduce((a,b)=>a+b.cx,0)/xs.length,cy:xs.reduce((a,b)=>a+b.cy,0)/xs.length}});for(let i=0;i<cs.length;i++){for(let j=i+1;j<cs.length;j++){s+=dist(cs[i],cs[j]);c++}}return s/Math.max(1,c)}
