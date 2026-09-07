import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const repo=process.env.SUBJECTSYSTEMS_REPO;
if(!repo) throw new Error('Set SUBJECTSYSTEMS_REPO to the repository being examined.');
const out=process.env.SUBJECT_RELATIONS_OUTPUT || path.join(repo,'outputs','subject-type-relations');
const model=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/model.json'),'utf8'));
const exploration=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/explorations.json'),'utf8'));
const completion=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/completions.json'),'utf8'));
const completionAnalysis=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/completion-analysis.json'),'utf8'));
const projectSubjects=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/project-subjects.json'),'utf8'));
const aboutHistory=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/about-history.json'),'utf8'));
await fs.mkdir(out,{recursive:true});
const terms=model.terms.map((r,i)=>({id:`C${String(i+1).padStart(2,'0')}`,name:r[0],sense:r[1],parents:r[2],example:r[3],not:r[4],alternative:r[5]}));
const names=terms.map(t=>t.name); const byName=new Map(terms.map(t=>[t.name,t]));
const n=terms.length; const projects=exploration.projects; const pn=projects.length;
const parents=new Map(terms.map(t=>[t.name,[...t.parents,...(t.name==='Subject'?[]:['Subject'])]]));
for(const [a,bs] of parents) for(const b of bs) assert(byName.has(b),`Unknown parent ${a}->${b}`);
const reach=new Map();
function ancestors(a){if(reach.has(a))return reach.get(a);const found=new Set([a]);const todo=[a];while(todo.length){const x=todo.pop();for(const p of parents.get(x)||[])if(!found.has(p)){found.add(p);todo.push(p);}}reach.set(a,found);return found;}
for(const a of names)ancestors(a);
function chain(a,b){if(a===b)return[a];const queue=[[a]];const seen=new Set([a]);while(queue.length){const p=queue.shift();for(const next of parents.get(p.at(-1))||[]){if(next===b)return[...p,next];if(!seen.has(next)){seen.add(next);queue.push([...p,next]);}}}return[];}
function shared(a,b){const common=[...ancestors(a)].filter(x=>ancestors(b).has(x));return common.filter(x=>!common.some(y=>y!==x&&ancestors(y).has(x)&&!ancestors(x).has(y)));}
const disjoint=model.disjoint_sense_rules.map((r,i)=>({id:`D${String(i+1).padStart(2,'0')}`,a:r[0],b:r[1],reason:r[2]}));
function separation(a,b){return disjoint.find(d=>(ancestors(a).has(d.a)&&ancestors(b).has(d.b))||(ancestors(a).has(d.b)&&ancestors(b).has(d.a)));}
const cases=[];
for(const t of terms)if(t.example)cases.push({id:`W${t.id.slice(1)}`,text:t.example,positive:[t.name],negative:t.not,basis:'Constructed separating case under the stated primary senses.'});
for(const [id,text,positive,negative] of model.extra_examples)cases.push({id,text,positive,negative,basis:'Constructed combined case; overlap is allowed and does not prove universal inclusion.'});
for(const c of cases){
 c.pos=new Set(c.positive.flatMap(a=>[...ancestors(a)]));
 c.neg=new Set(names.filter(b=>c.negative.some(a=>ancestors(b).has(a))));
 for(const a of c.pos)for(const b of names)if(separation(a,b))c.neg.add(b);
 const conflict=[...c.pos].filter(x=>c.neg.has(x)); assert(!conflict.length,`${c.id} contradictory memberships: ${conflict}`);
}
const relationLookup=new Map(model.related_predicates.map(r=>[`${r[0]}|${r[1]}`,`${r[2]}: ${r[3]}`]));
function decide(a,b){
 if(a===b)return{code:'S',basis:'Reflexivity only',reason:'The same named class is included in itself; this adds no substantive knowledge of its meaning.',witness:'',overlap:'Identity',other:''};
 if(b==='Subject')return{code:'Y',basis:'Potential-subject convention',reason:'The class is admitted under Subject because any instance can be considered. This is a possible role, not actual attention.',witness:'R-Subject',overlap:'Containment',other:''};
 if(!byName.get(a).sense||!byName.get(b).sense)return{code:'?',basis:'Unresolved meaning',reason:'Promoting has no adopted meaning. Its earlier withdrawal is not a proof of exclusion from another class.',witness:'',overlap:'Unresolved',other:''};
 const counter=cases.find(c=>c.pos.has(a)&&c.neg.has(b));
 if(ancestors(a).has(b)){assert(!counter,`Admitted inclusion contradicted: ${a}->${b} by ${counter?.id}`);return{code:'Y',basis:'Definition / admitted implication',reason:chain(a,b).join(' → '),witness:'Rules',overlap:ancestors(b).has(a)?'Equivalent extensions in this model':'Containment',other:relationLookup.get(`${a}|${b}`)||''};}
 const sep=separation(a,b);const overlap=cases.find(c=>c.pos.has(a)&&c.pos.has(b));
 if(sep)return{code:'N',basis:'Disjoint primary senses',reason:`${a} / ${b}: ${sep.reason}`,witness:sep.id,overlap:'Disjoint under the stated sense rule',other:relationLookup.get(`${a}|${b}`)||''};
 if(counter)return{code:overlap?'O':'N',basis:'Separating constructed case',reason:`${counter.id}: ${counter.text}`,witness:counter.id,overlap:overlap?`${overlap.id}: overlap is possible; universal inclusion fails`:'No overlap established here; exclusion is NOT inferred',other:relationLookup.get(`${a}|${b}`)||''};
 return{code:'?',basis:overlap?'Overlap without a universal argument':'No adequate inclusion or exclusion argument',reason:overlap?`${overlap.id} supplies overlap but neither a universal inclusion proof nor a separating case in this direction.`:'No admitted implication, applicable sense exclusion, or separating case establishes this direction. Missing evidence is not a negative verdict.',witness:overlap?.id||'',overlap:overlap?`Constructed overlap: ${overlap.id}`:'Unresolved',other:relationLookup.get(`${a}|${b}`)||''};
}
const decisions=names.map(a=>names.map(b=>decide(a,b)));
const stats=Object.fromEntries(['Y','N','O','?','S'].map(s=>[s,decisions.flat().filter(x=>x.code===s).length]));
assert.equal(decisions[0][1].code,'O','Improvement is not universally Development, but their overlap must be shown.');
assert.equal(decisions[1][0].code,'O','Development is not universally Improvement.');
assert.equal(decisions[2][3].code,'N','Capability/creation sense distinction must be represented.');
assert.equal(decisions[3][2].code,'N','Reversed capacity/creation claim must also be tested.');
assert.equal(decide('Planning','Strategy').code,'Y');assert.equal(decide('Strategy','Planning').code,'Y');
assert.equal(decide('Promoting','Creation').code,'?');

const profileBase=`https://github.com/benjam3n/subjectsystems/blob/${model.basis_commit}/systems/`;
const projectInfo=[];
for(let i=0;i<pn;i++){
 const [name,slug,view,direct,core,targets,reframe,negative,limit]=projects[i];
 const text=await fs.readFile(path.join(repo,`systems/${slug}.md`),'utf8');
 const urls=[...text.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map(m=>m[1]);
 projectInfo.push({id:`P${String(i+1).padStart(2,'0')}`,name,slug,view,direct,core,targets,reframe,negative,limit,profile:profileBase+slug+'.md',sources:[...new Set(urls)].slice(0,4),kinds:new Set(direct.flatMap(a=>[...ancestors(a)]))});
}
function projectKind(p,b){
 if(b==='Subject')return{code:'Y',basis:'Possible subject role',reason:'The named project or unresolved proposal can be considered. This does not establish its implementation.'};
 if(!p.direct.length)return{code:'?',basis:'Defining source unresolved',reason:p.limit};
 if(p.kinds.has(b))return{code:'Y',basis:'Source-described kind; not subtype or runtime proof',reason:`${p.view} Source-supported kind path: ${p.direct.filter(a=>ancestors(a).has(b)).map(a=>chain(a,b).join(' → ')).join('; ')}`};
 const sep=p.direct.map(a=>separation(a,b)).find(Boolean);
 if(sep)return{code:'N',basis:`Fixed artifact/specification view; ${sep.id}`,reason:`The classified view is a described artifact or specification, not an execution, changed result, capacity, or abstract relation. ${sep.reason}`};
 if(!byName.get(b).sense)return{code:'?',basis:'Unresolved meaning',reason:'Promoting remains undefined.'};
 return{code:'?',basis:'Kind not established by inspected profile',reason:p.targets.includes(b)?`The source uses, studies, or supports ${b}; that relation does not establish kind membership. ${p.core}`:`The inspected profile does not establish this kind assignment. ${p.core}`};
}
const projectDecisions=projectInfo.map(p=>names.map(b=>projectKind(p,b)));
const completed=[];
for(const [root,entries] of completion.groups)for(const [label,head,role,sense] of entries)completed.push({id:`E${String(completed.length+1).padStart(3,'0')}`,root,label,heads:head?head.split('+'):[],role,sense,standing:head?'Working completed expression; the reading and parent assumptions are explicit.':'Meaning unresolved; no completed type supplied.',source:'User attachment and current analysis; not a dictionary definition.',family:'Concept'});
for(const [root,entries] of projectSubjects.groups){
 const p=projectInfo.find(p=>p.name===root);assert(p,`Unknown project ${root}`);
 for(const [label,head,matter,result] of entries)completed.push({id:`E${String(completed.length+1).padStart(3,'0')}`,root,label,heads:head.split('+'),role:'Specified work or contribution',sense:matter,result,standing:projectSubjects.standing,source:p.profile,family:'Project'});
}
for(const e of completed){for(const h of e.heads)assert(byName.has(h),`Unknown expression head ${h}`);for(const a of e.heads)for(const b of e.heads)assert(!separation(a,b),`Inconsistent expression ${e.id}: ${a} / ${b}`);e.equivalent=completion.equivalent_readings[e.label]||null;if(e.equivalent){assert(e.heads.length===1&&e.heads[0]===e.equivalent,`Invalid equivalence declaration ${e.label}`);e.standing=`Explicitly the same fixed sense as ${e.equivalent} in Concepts. This wording spells out that reading; it does not add a narrowing condition.`;}}
for(const name of names)assert(completion.groups.some(g=>g[0]===name),`No subject-completion entry for ${name}`);
for(const p of projectInfo)assert(projectSubjects.groups.some(g=>g[0]===p.name),`No project subjects for ${p.name}`);
function completedKind(e,b){
 if(b==='Subject')return{code:'Y',basis:'Potential-subject convention',reason:'The specified item or unresolved label can be considered.'};
 if(!e.heads.length||!byName.get(b).sense)return{code:'?',basis:'Unresolved meaning',reason:'No meaning or parent assumption is invented for an unresolved label.'};
 if(e.equivalent){const d=decide(e.equivalent,b);return{...d,code:d.code==='S'?'Y':d.code,basis:`Explicit equivalent reading; ${d.basis}`,reason:`This expression is explicitly the same fixed sense as ${e.equivalent}, so the same cases apply. ${d.reason}`};}
 const head=e.heads.find(h=>ancestors(h).has(b));
 if(head)return{code:'Y',basis:'Qualified definition plus universal inclusion',reason:`${e.label} is defined to satisfy ${head}. ${chain(head,b).join(' → ')}. The declared relation to its topic does not automatically add a genus.`};
 const sep=e.heads.map(h=>separation(h,b)).find(Boolean);
 if(sep)return{code:'N',basis:`Inherited explicit disjointness: ${sep.id}`,reason:`The completed expression retains the stated head meaning. ${sep.reason}`};
 return{code:'?',basis:'No qualification-specific proof or countercase',reason:'A broad head-class counterexample does not refute this narrower class. Only an applicable inclusion, explicit disjointness, or a case satisfying this expression would settle this comparison.'};
}
const completedDecisions=completed.map(e=>names.map(b=>completedKind(e,b)));
const refinedDevelopment=completed.find(e=>e.label==='development improvement');
assert.equal(completedKind(refinedDevelopment,'Improvement').code,'Y');
assert.equal(decide('Development','Improvement').code,'O');
assert.equal(completedKind({label:'Qualified development',heads:['Development']},'Improvement').code,'?','A broad separating case must not be inherited by an unspecified subclass.');
assert.equal(completedKind(completed.find(e=>e.label==='development process'),'Improvement').code,'O','An explicitly equivalent reading retains the actual separating and overlapping cases.');
assert.equal(completedKind(completed.find(e=>e.label==='intelligence improvement'),'Change').code,'Y');
assert.equal(completedKind(completed.find(e=>e.label==='intelligence improvement'),'Capability').code,'N');
assert.equal(aboutHistory.records.length,58);assert.equal(aboutHistory.records.filter(r=>r.status==='deleted').length,1);
const en=completed.length;const epEnd=5+en*n;
const compiled={term_count:n,project_count:pn,concept_comparisons:n*n,project_kind_comparisons:pn*n,project_pair_comparisons:pn*pn,expression_rows:en,resolved_expressions:completed.filter(e=>e.heads.length).length,expression_comparisons:en*n,order_trials:completionAnalysis.orders.length,history_revisions:aboutHistory.records.length,stats,cases:cases.map(({pos,neg,...c})=>c)};
await fs.writeFile(path.join(out,'analysis-check.json'),JSON.stringify(compiled,null,2));
console.log(JSON.stringify({stage:'analysis',...compiled,cases:compiled.cases.length}));
if(process.argv.includes('--analyze-only'))process.exit(0);

const wb=Workbook.create();
const sheetNames=['Read Me','Subject Completions','Completed Types','Expression Pairs','Order Trials','Qualification Tests','Project Subjects','About History','Wording Changes','Concepts','Type Lists','Type Matrix','Concept Pairs','Reversals','Common Parents','Project Notes','Project Lists','Project Kinds','Project Pairs','Cases','Rules','Sources'];
const sh=Object.fromEntries(sheetNames.map(name=>[name,wb.worksheets.add(name)]));
const ink='#172B3A',teal='#176B68',light='#E7F2EF',muted='#526474',white='#FFFFFF',paper='#F7F9FB';
function col(i){let s='';for(i++;i;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s;}
function setup(name,title,subtitle,headers,rows,widths,{height=76,table=true}={}){
 const s=sh[name];const last=col(headers.length-1);const end=5+rows.length;s.showGridLines=false;
 s.getRange(`A1:${last}${Math.max(end,5)}`).format.font={name:'Aptos',size:11,color:ink};
 const titleLast=col(Math.min(headers.length-1,3));
 s.getRange(`A1:${titleLast}2`).merge();s.getRange('A1').values=[[title]];s.getRange(`A1:${titleLast}2`).format={fill:ink,font:{name:'Aptos Display',size:20,bold:true,color:white},rowHeight:22,verticalAlignment:'center',wrapText:true};
 s.getRange(`A3:${titleLast}3`).merge();s.getRange('A3').values=[[subtitle]];s.getRange(`A3:${titleLast}3`).format={font:{size:11,color:muted},wrapText:true,rowHeight:55,verticalAlignment:'center'};
 s.getRange(`A5:${last}5`).values=[headers];s.getRange(`A5:${last}5`).format={fill:teal,font:{bold:true,color:white},rowHeight:34,wrapText:true,verticalAlignment:'center'};
 if(rows.length){s.getRange(`A6:${last}${end}`).values=rows;s.getRange(`A6:${last}${end}`).format={wrapText:true,verticalAlignment:'top',rowHeight:height};if(table){const t=s.tables.add(`A5:${last}${end}`,true,`Table_${name.replaceAll(' ','')}`);t.showFilterButton=true;t.style='TableStyleLight1';}
  if(table)rows.forEach((row,i)=>{const lines=Math.max(...row.map((v,c)=>String(v??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/(widths[c]*0.83))),0)));s.getRange(`A${i+6}:${last}${i+6}`).format.rowHeight=Math.min(height,Math.max(38,lines*14+12));});
 }
 widths.forEach((w,i)=>s.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=w);
 s.freezePanes.freezeRows(5);s.freezePanes.freezeColumns(1);return s;
}
function statusFormat(s,range){
 const r=s.getRange(range); const first=range.split(':')[0];
 for(const [v,bg,fg] of [['Y','#DBEEE6','#15533C'],['N','#F8E1E0','#932F32'],['O','#FFF0CF','#805700'],['?','#E8EDF2','#556678'],['S','#DDE9F2','#244C70']])r.conditionalFormats.addCustom(`${first}="${v}"`,{fill:bg,font:{color:fg,bold:true}});
}
setup('Subject Completions','Specify what the subject name leaves implicit','A short phrase receives one explicit reading. Parent kinds follow that reading. The last columns offer two index orders for the same expression ID; they are not new type claims.', ['ID','Broad label / project','Completed expression','Declared parent kinds','Role of the broad label','Exact reading / matter considered','Standing','Source','Topic-first index','Kind-first index'],completed.map(e=>[e.id,e.root,e.label,e.heads.join('; ')||'Unresolved',e.role,e.sense,e.standing,e.source,null,null]),[9,26,49,34,34,95,81,95,71,71],{height:132});
for(let i=0;i<en;i++){const r=i+6;sh['Subject Completions'].getRange(`I${r}:J${r}`).formulas=[[`="Topic: "&B${r}&" | Kind: "&D${r}&" | "&A${r}`,`="Kind: "&D${r}&" | Topic: "&B${r}&" | "&A${r}`]];}
const expressionPairRows=[];for(let i=0;i<en;i++)for(let j=0;j<n;j++){const d=completedDecisions[i][j];expressionPairRows.push([completed[i].id,completed[i].label,names[j],d.code,d.basis,d.reason]);}
setup('Expression Pairs','Each completed expression × every base kind','Definitions and explicit disjointness are applied to the narrower expression. A counterexample to a broad head-class universal is never silently inherited.', ['Expression ID','Completed expression','Candidate kind','Result','Ground','Reason'],expressionPairRows,[14,55,24,10,48,115],{height:116});
statusFormat(sh['Expression Pairs'],`D6:D${epEnd}`);sh['Expression Pairs'].getRange(`D6:D${epEnd}`).dataValidation={rule:{type:'list',values:['Y','N','O','?','S']}};
setup('Completed Types','The type lists after completing the subject','Lists reference Expression Pairs. Explicitly equivalent readings retain their cases; narrower expressions need applicable disjointness or a case satisfying their actual qualifier. Missing grounds stay open.', ['Broad label / project','Completed expression','Is a type of — admitted','Is not a type of — supported','Still open','Expression ID'],completed.map(e=>[e.root,e.label,null,null,null,e.id]),[27,49,67,85,92,14],{height:245});
for(let i=0;i<en;i++){const start=6+i*n,end=start+n-1,r=i+6;const c=`'Expression Pairs'!$C$${start}:$C$${end}`,d=`'Expression Pairs'!$D$${start}:$D$${end}`;sh['Completed Types'].getRange(`C${r}:E${r}`).formulas=[[
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="Y","—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},((${d}="N")+(${d}="O"))>0,"—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="?","—"))`
 ]];const texts=['Y','N','?'].map(code=>names.filter((_,j)=>code==='N'?['N','O'].includes(completedDecisions[i][j].code):completedDecisions[i][j].code===code).join(', '));const lines=Math.max(...texts.map((t,k)=>Math.ceil(t.length/([67,85,92][k]*0.83))));sh['Completed Types'].getRange(`A${r}:F${r}`).format.rowHeight=Math.min(245,Math.max(70,lines*14+12));}
setup('Order Trials','Change the order, attachment, relation, and scope','These are explicitly selected readings to compare. Six permutations of intelligence / maintenance / improvement are included. An identical order can still hide different relations.', ['Form A','Form B','Explicit reading A','Explicit reading B','Kind A','Kind B','What changes','Separating or equivalence case'],completionAnalysis.orders,[32,32,64,64,27,27,78,98],{height:146});
setup('Qualification Tests','What may and may not follow from a completion','A change in the classified unit differs from narrowing the same class. Shared wording, extra modifiers, and a convenient index do not establish semantic containment or exclusive branches.', ['ID','Test','Starting expression or claim','Completed comparison','Consequence','What the test prevents'],completionAnalysis.qualification_tests,[10,44,62,88,87,100],{height:155});
const projectSubjectRows=completed.filter(e=>e.family==='Project').map(e=>[e.id,e.root,e.label,e.heads.join('; '),e.sense,e.result,e.standing,e.source]);
setup('Project Subjects','Specify the work within each project family','Three purpose-specific subjects are defined for each source family. These describe kinds of work or contributions, with native source grounding; they do not certify implementation or effects.', ['Expression ID','Project','Completed project subject','Declared parent kinds','Exact matter','Proposed concrete contribution','Standing','Pinned source profile'],projectSubjectRows,[14,26,56,31,93,96,95,95],{height:155});
const excelDate=s=>(Date.parse(s)-Date.UTC(1899,11,30))/86400000;
setup('About History','All 58 revisions of the specified About page on main',aboutHistory.coverage, ['Date (UTC)','Commit','Commit description','File status','Changed text groups','Assessment for this inquiry','Revision link','Raw SHA-256'],aboutHistory.records.map(r=>[excelDate(r.date),r.sha,r.message,r.status,r.changed_groups,r.assessment,r.url,r.raw_sha256]),[24,43,79,14,18,122,115,68],{height:155});
sh['About History'].getRange(`A6:A${5+aboutHistory.records.length}`).setNumberFormat('yyyy-mm-dd hh:mm');sh['About History'].getRange(`E6:E${5+aboutHistory.records.length}`).setNumberFormat('0');
const aboutURL=sha=>`https://github.com/benjam3n/reasoningtool/blob/${sha}/website/src/pages/about.astro`;
setup('Wording Changes','What the earlier form preserved and what later edits changed','Earlier/later cells contain short excerpts or paraphrases; interpretation is current analysis. The source history documents the approach, not the truth of every claim made in the essay.', ['Period','Earlier wording / précis','Later wording / précis','Consequence for typing','Change classification','Earlier source','Later source'],completionAnalysis.wording_changes.map(r=>[...r.slice(0,5),aboutURL(r[5]),aboutURL(r[6])]),[25,78,85,107,77,115,115],{height:173});
const conceptRows=terms.map(t=>[t.id,t.name,t.sense||'UNRESOLVED — no adopted meaning',t.alternative,t.parents.join('; ')||'Subject only',t.name==='Promoting'?'Undefined / withdrawn label':'Working sense for this exploration, not a universal lexical claim']);
setup('Concepts','The primary meanings in the first comparison','One selected sense per broad word. Subject Completions now expands what each label can refer to; these older primary senses do not settle all qualified expressions.', ['ID','Term','Primary working sense','Alternative reading to explore','Direct parent assumptions','Standing'],conceptRows,[9,24,67,67,30,40],{height:105});

const pairRows=[];
for(let i=0;i<n;i++)for(let j=0;j<n;j++){const d=decisions[i][j];pairRows.push([`${terms[i].id}>${terms[j].id}`,names[i],names[j],d.code,null,d.basis,d.witness,d.reason,d.overlap,d.other||'No additional relation asserted by this comparison.']);}
const pairEnd=5+pairRows.length;
setup('Concept Pairs','Every ordered concept comparison','Read A → B as “every A, under its stated sense and context, is a B.” N and O refute this universal; only the named disjointness rules claim exclusion of overlap.', ['Pair','A — proposed subtype','B — proposed parent','Result','Reverse','Ground','Case / rule','Reason or separating case','Overlap standing','Other relation worth preserving'],pairRows,[15,24,24,10,10,34,14,85,47,75],{height:88});
sh['Concept Pairs'].getRange(`E6:E${pairEnd}`).formulas=names.flatMap((_,i)=>names.map((__,j)=>[`='Concept Pairs'!D${6+j*n+i}`]));
statusFormat(sh['Concept Pairs'],`D6:E${pairEnd}`);
sh['Concept Pairs'].getRange(`D6:D${pairEnd}`).dataValidation={rule:{type:'list',values:['Y','N','O','?','S']}};

const matrixRows=terms.map(t=>[t.name,...Array(n).fill(null)]);
setup('Type Matrix','Subtype matrix · read row → column','Y: admitted inclusion · N: refuted under stated senses · O: overlap with a separating case · ?: open · S: self. IDs resolve in Concepts.', ['A → B',...terms.map(t=>t.id)],matrixRows,[27,...Array(n).fill(5)],{height:24,table:false});
sh['Type Matrix'].getRange(`B6:${col(n)}${5+n}`).formulas=names.map((_,i)=>names.map((__,j)=>`='Concept Pairs'!D${6+i*n+j}`));
sh['Type Matrix'].getRange(`B5:${col(n)}${5+n}`).format.horizontalAlignment='center';statusFormat(sh['Type Matrix'],`B6:${col(n)}${5+n}`);

setup('Type Lists','Each concept: type of / not a type of / open','These lists update from the Concept Pairs result column. “Not a type of” includes overlap cases; it does not mean “unrelated.” Self-pairs are omitted.', ['Concept','Is a type of — admitted','Is not a type of — refuted','Still open','Reading note'],terms.map(t=>[t.name,null,null,null,t.alternative]),[24,67,92,75,68],{height:240});
for(let i=0;i<n;i++){const start=6+i*n,end=start+n-1;const r=6+i;const c=`'Concept Pairs'!$C$${start}:$C$${end}`,d=`'Concept Pairs'!$D$${start}:$D$${end}`;sh['Type Lists'].getRange(`B${r}:D${r}`).formulas=[[
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="Y","—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},((${d}="N")+(${d}="O"))>0,"—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="?","—"))`
]];const texts=['Y','N','?'].map(code=>names.filter((_,j)=>code==='N'?['N','O'].includes(decisions[i][j].code):decisions[i][j].code===code).join(', '));const lines=Math.max(...texts.map((t,k)=>Math.ceil(t.length/([67,92,75][k]*0.83))));sh['Type Lists'].getRange(`A${r}:E${r}`).format.rowHeight=Math.min(240,Math.max(58,lines*14+12));}

const reversalRows=exploration.reversals.map((r,i)=>[`R${String(i+1).padStart(2,'0')}`,r[0],r[1],byName.has(r[0])&&byName.has(r[1])?`${decide(r[0],r[1]).code} / ${decide(r[1],r[0]).code}`:'New proposed parent',r[2],r[3],r[4],r[5],r[6]]);
setup('Reversals','What happens when the type direction changes','Conditional reconstructions, not automatically admitted edges. Each direction says what must change in meaning, what becomes visible, and which case tests the interpretation.', ['ID','A','B','Primary A→B / B→A','Try A as a type of B','Try B as a type of A','Common parent proposal','Consequence of the change','Discriminating case'],reversalRows,[9,22,22,24,76,76,60,67,70],{height:132});

const commonRows=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const mins=shared(names[i],names[j]);commonRows.push([names[i],names[j],mins.join('; '),[...ancestors(names[i])].filter(x=>ancestors(names[j]).has(x)).join('; '),mins.length===1&&mins[0]==='Subject'?'Only the broad potential-subject role is established. A more informative common parent remains a proposal.':'Most specific only among the admitted parent assumptions; not a unique final ontology.',decisions[i][j].code,decisions[j][i].code]);}
setup('Common Parents','Common parents without forcing one hierarchy','Computed from the visible admitted implications, including their transitive consequences. A shared parent does not make the two children exclusive or exhaustive.', ['A','B','Most specific admitted common parents','All admitted common parents','Interpretation','A→B','B→A'],commonRows,[24,24,58,85,80,10,10],{height:74});

const pnoteRows=projectInfo.map(p=>[p.id,p.name,p.view,p.direct.join('; ')||'Unresolved',p.core,p.targets.join('; '),p.reframe,p.negative,p.limit,p.profile]);
setup('Project Notes','Projects examined through their actual contributions','The classified view is explicit. A repository, a described method, a method execution, and demonstrated capability are different items. Source profiles are pinned to the inspected repository revision.', ['ID','Project','View being classified','Source-supported kinds','Native contribution','Uses / studies / supports','Productive reinterpretation','Negative or inverse test','Source limit','Pinned source profile'],pnoteRows,[9,26,63,33,64,50,73,74,66,85],{height:140});

const pkRows=[];for(let i=0;i<pn;i++)for(let j=0;j<n;j++){const d=projectDecisions[i][j];pkRows.push([projectInfo[i].name,names[j],d.code,d.basis,d.reason,projectInfo[i].targets.includes(names[j])?'Uses / studies / supports; not kind membership by itself':'No target/use relation asserted here',projectInfo[i].profile]);}
const pkEnd=5+pkRows.length;
setup('Project Kinds','Every project × every concept','These are kind assignments for the explicitly described project view, not universal subtype claims about all files, runs, or future versions of a repository.', ['Project','Candidate kind','Result','Basis','Reason','Other relation','Pinned source profile'],pkRows,[26,24,10,48,99,62,95],{height:100});statusFormat(sh['Project Kinds'],`C6:C${pkEnd}`);
sh['Project Kinds'].getRange(`C6:C${pkEnd}`).dataValidation={rule:{type:'list',values:['Y','N','O','?','S']}};
setup('Project Lists','Each project: kinds / excluded kinds / open','Formula-driven lists of the classifications in Project Kinds. “Uses intelligence” and “is an intelligent capability” remain separate claims.', ['Project','Has the described kinds','Is not the stated kind in this view','Not established','Useful alternative reading'],projectInfo.map(p=>[p.name,null,null,null,p.reframe]),[28,70,94,94,74],{height:245});
for(let i=0;i<pn;i++){const start=6+i*n,end=start+n-1,r=6+i;const c=`'Project Kinds'!$B$${start}:$B$${end}`,d=`'Project Kinds'!$C$${start}:$C$${end}`;sh['Project Lists'].getRange(`B${r}:D${r}`).formulas=[[
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="Y","—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="N","—"))`,
 `=TEXTJOIN(", ",TRUE,FILTER(${c},${d}="?","—"))`
]];const texts=['Y','N','?'].map(code=>names.filter((_,j)=>projectDecisions[i][j].code===code).join(', '));const lines=Math.max(...texts.map((t,k)=>Math.ceil(t.length/([70,94,94][k]*0.83))));sh['Project Lists'].getRange(`A${r}:E${r}`).format.rowHeight=Math.min(245,Math.max(70,lines*14+12));}

const ppRows=[];for(const a of projectInfo)for(const b of projectInfo){const identity=a.name===b.name;const kinds=[...a.kinds].filter(k=>b.kinds.has(k));const uses=a.targets.filter(k=>b.targets.includes(k));ppRows.push([a.name,b.name,identity?'S':'?',kinds.join('; ')||'No informative common kind established',uses.join('; ')||'No shared target recorded',identity?'Identity of the named source does not prove effectiveness.':`Distinct names and shared uses establish neither inclusion nor exclusion. Compare A's core (${a.core}) with B's (${b.core}).`,identity?'No substantive reversal.':`Proposed separation test: can the complete A specification be satisfied while omitting B's defining structure? A valid such construction would refute A→B. Exact source contracts are needed before claiming it succeeds.`,a.profile,b.profile]);}
setup('Project Pairs','Project-to-project type claims remain explicit','Every ordered pair is present. Distinct repositories are not assumed disjoint, and a shared method or purpose is not a subtype proof. Open cells identify absent source-grounded containment arguments.', ['A','B','Subtype result','Common described kinds','Shared recorded uses','What the source evidence establishes','Exact missing discrimination','A source','B source'],ppRows,[28,28,13,72,53,105,110,80,80],{height:146});statusFormat(sh['Project Pairs'],`C6:C${5+ppRows.length}`);

setup('Cases','Separating cases and overlap witnesses','Constructed cases under the declared senses, not observed experiments. A case in A but not B refutes A⊆B; a case in both establishes possible overlap but not universal inclusion.', ['ID','Constructed case','Explicit positive memberships','Explicit negative memberships','Standing'],cases.map(c=>[c.id,c.text,c.positive.join('; '),c.negative.join('; '),c.basis]),[10,105,70,92,66],{height:106});
const ruleRows=[];
for(const t of terms)for(const p of t.parents)ruleRows.push([`I${String(ruleRows.length+1).padStart(3,'0')}`,'Admitted implication',t.name,p,`${t.name}: ${t.sense} The parent assumption is explicit and can be challenged.`]);
ruleRows.push(['R-Subject','Admitted convention','Every listed term','Subject','Potential role of being considered; does not imply current attention, usefulness, or a type relation between every pair.']);
for(const d of disjoint)ruleRows.push([d.id,'Disjoint primary senses',d.a,d.b,d.reason]);
ruleRows.push(['R-Transitive','Deduction rule','A⊆B and B⊆C','A⊆C','Only within the same declared senses, units, and context. No transitivity across a can-produce or can-use edge.']);
ruleRows.push(['R-Counter','Refutation rule','One instance in A and not B','Not A⊆B','The classes can still overlap. Negating universal inclusion does not establish disjointness.']);
ruleRows.push(['R-Both','Equivalence consequence','A⊆B and B⊆A','Same extension in this model','This need not mean identical ordinary meanings. It can show that two intended levels collapse under the chosen definitions.']);
ruleRows.push(['R-Unknown','Evidence discipline','No implication or countercase','Open','A missing link is not a negative verdict. More source evidence or an explicit separating construction is needed.']);
setup('Rules','Visible assumptions and inference rules','All automatic results come from these stated implications, sense exclusions, and the Cases sheet. The matrix is an inspectable model, not thousands of independently observed facts.', ['Rule','Kind','A / antecedent','B / consequence','Ground and limit'],ruleRows,[13,30,44,44,118],{height:91});
setup('Sources','Sources and analytical standing','Concept definitions, cases, and reinterpretations were developed for this request. Project claims are limited to the source profiles inspected at the pinned revision; original runtime behavior was not re-tested.', ['Source','What it supports','Pinned profile or current analysis','Additional original-source links','Limit'],projectInfo.map(p=>[p.name,p.core,p.profile,p.sources.join('\n')||'No defining source attached',p.limit]),[28,90,110,130,82],{height:142});

const intro=sh['Read Me'];intro.showGridLines=false;intro.getRange('A1:F37').format.font={name:'Aptos',size:11,color:ink};
intro.getRange('A1:F2').merge();intro.getRange('A1').values=[['Subject Completion and Type Relations']];intro.getRange('A1:F2').format={fill:ink,font:{name:'Aptos Display',size:25,bold:true,color:white},rowHeight:25,verticalAlignment:'center'};
intro.getRange('A3:F3').merge();intro.getRange('A3').values=[['Complete the expression. Change its order and relations. Then test its types and exclusions.']];intro.getRange('A3:F3').format={font:{size:13,color:teal},rowHeight:34,wrapText:true};
intro.getRange('A5:B10').values=[['Coverage','Count'],['Base kinds compared',null],['Expression rows',null],['Expression × kind comparisons',null],['Source project families',null],['About page revisions',null]];
intro.getRange('B6:B10').formulas=[[`=COUNTA('Concepts'!$B$6:$B$${5+n})`],[`=COUNTA('Subject Completions'!$A$6:$A$${5+en})`],[`=COUNTA('Expression Pairs'!$A$6:$A$${epEnd})`],[`=COUNTA('Project Notes'!$B$6:$B$${5+pn})`],[`=COUNTA('About History'!$B$6:$B$${5+aboutHistory.records.length})`]];
intro.getRange('D5:F10').values=[['Code','Meaning','Reading'],['Y','Admitted inclusion','All A are B under the stated assumptions.'],['N','Universal inclusion refuted','Do not infer that no A can also be B.'],['O','Overlap plus counterexample','Some overlap is demonstrated; not all A are B.'],['?','Open','Insufficient grounds; not a disguised No.'],['S','Identity','Self-comparison only.']];
for(const range of ['A5:B5','D5:F5'])intro.getRange(range).format={fill:teal,font:{bold:true,color:white},rowHeight:28};
intro.getRange('A6:F10').format={wrapText:true,rowHeight:43,verticalAlignment:'center'};intro.getRange('B6:B10').setNumberFormat('#,##0');intro.getRange('B6:B10').format.font={size:19,bold:true,color:teal};
const notes=[
 ['Start with Subject Completions','The classified item is explicit. Intelligence improvement is a beneficial change in a capability; intelligence maintenance is work preserving it. An omitted relation or qualifier can change the answer.'],
 ['Then use Completed Types','Lists show admitted types, supported negatives, and open comparisons for each specified expression. Expression Pairs contains the grounds. One Promoting row remains meaning-unresolved.'],
 ['Broad negatives do not pass to narrower types','Development need not improve anything. Development that improves intelligence nevertheless belongs to both Development and Improvement. Qualification Tests records this and the other inheritance conditions.'],
 ['Order and relation are separate','Order Trials compares word order, modifier attachment, nested scope, and negation. Technical writing and Writing technical can name the same specified kind; Art writing and Writing art can concern different items.'],
 ['One expression, multiple indexes','Subject Completions offers topic-first and kind-first indexes tied to one expression ID. Changing the index order does not change the type; changing a target, means, product, or qualifier may change it.'],
 ['The project subjects are particular','Project Subjects specifies three distinct kinds of work or contribution for every source family. These are proposed purpose-specific subjects, not proof that the project implements or succeeds at each contribution.'],
 ['The history is inspected','About History covers all 58 main-history revisions of the specified Reasoningtool page. Wording Changes separates preserved type patterns, grammar changes, altered relationships, and changed commitments.'],
 ['The first matrix now has a clearer scope','Concepts, Type Lists, and Type Matrix retain one explicit primary sense per broad word. They do not decide all completed expressions. Reversals still supplies alternative accounts and common-parent proposals.'],
 ['Editing and dependent results','Editable result cells in Expression Pairs, Concept Pairs, and Project Kinds drive their lists. Definitions, parent assumptions, and completed readings require renewed analysis when changed; formulas do not infer revised prose.'],
 ['Boundaries and standing','A specified topic and a specified kind are different relations. Extra words do not guarantee exclusive siblings. Missing evidence remains open; Promoting and the Master Framework source identity remain unresolved.'],
 ['What the completion reveals','A subject may need a target, operation, result, condition, standard, or relation before a consequential type question becomes answerable. Completeness is relative to that question, not to phrase length.']
];
for(let i=0;i<notes.length;i++){const row=13+i*2;intro.getRange(`A${row}:B${row+1}`).merge();intro.getRange(`C${row}:F${row+1}`).merge();intro.getRange(`A${row}`).values=[[notes[i][0]]];intro.getRange(`C${row}`).values=[[notes[i][1]]];intro.getRange(`A${row}:F${row+1}`).format={wrapText:true,rowHeight:31,verticalAlignment:'center'};intro.getRange(`A${row}:B${row+1}`).format={fill:i%2?paper:light,font:{bold:true,color:teal}};}
for(const [c,w]of [['A',23],['B',18],['C',22],['D',11],['E',32],['F',52]])intro.getRange(`${c}1:${c}37`).format.columnWidth=w;
intro.freezePanes.freezeRows(3);

const key=await wb.inspect({kind:'table',range:"'Read Me'!A5:F10",include:'values,formulas',tableMaxRows:6,tableMaxCols:6,maxChars:3500});console.log(key.ndjson);
const listCheck=await wb.inspect({kind:'table',range:"'Type Lists'!A6:D9",include:'values,formulas',tableMaxRows:4,tableMaxCols:4,tableMaxCellChars:100,maxChars:3500});console.log(listCheck.ndjson);
const completionCheck=await wb.inspect({kind:'table',range:"'Completed Types'!A8:E11",include:'values,formulas',tableMaxRows:4,tableMaxCols:5,tableMaxCellChars:90,maxChars:2500});console.log(completionCheck.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Formula error scan',maxChars:2000});console.log(errors.ndjson); assert(!errors.ndjson.includes("\"kind\":\"match\""), "Formula errors remain");
await fs.writeFile(path.join(out,'formula-check.txt'),errors.ndjson);

const renderRanges={
 'Read Me':'A1:F37','Subject Completions':'A1:F8','Completed Types':'A1:E7','Expression Pairs':'A1:F8','Order Trials':'A1:F8','Qualification Tests':'A1:F8','Project Subjects':'A1:F8','About History':'A1:F8','Wording Changes':'A1:E7','Concepts':'A1:D9','Type Lists':'A1:D7','Type Matrix':'A1:K16','Concept Pairs':'A1:H8','Reversals':'A1:F7','Common Parents':'A1:E8','Project Notes':'A1:F7','Project Lists':'A1:D7','Project Kinds':'A1:F8','Project Pairs':'A1:F7','Cases':'A1:D8','Rules':'A1:E8','Sources':'A1:E7'
};
for(const name of sheetNames){const blob=await wb.render({sheetName:name,range:renderRanges[name],scale:1,format:'png'});await fs.writeFile(path.join(out,`preview-${name.replaceAll(' ','-')}.png`),new Uint8Array(await blob.arrayBuffer()));console.log(`Rendered ${name}`);}
const file=await SpreadsheetFile.exportXlsx(wb);await file.save(path.join(out,'Subject_Type_Relations.xlsx'));
console.log(JSON.stringify({stage:'exported',file:path.join(out,'Subject_Type_Relations.xlsx'),sheets:sheetNames.length,concepts:n,projects:pn,expressions:en,resolvedExpressions:completed.filter(e=>e.heads.length).length,expressionComparisons:en*n,historyRevisions:aboutHistory.records.length,cases:cases.length,reversals:exploration.reversals.length}));
