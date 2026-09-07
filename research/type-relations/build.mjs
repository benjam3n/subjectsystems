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
const naming=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/subject-names.json'),'utf8'));
const nameAnalysis=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/subject-name-analysis.json'),'utf8'));
const integration=JSON.parse(await fs.readFile(path.join(repo,'research/type-relations/subject-integration.json'),'utf8'));
const integrationSources=new Map(integration.sources.map(s=>[s.id,s]));
const sourceURLs=ids=>[...new Set(ids.map(id=>integrationSources.get(id)?.url).filter(Boolean))].join('\n');
const namedSubjects=naming.subjects;
const namedSet=new Set(namedSubjects.map(e=>e.name));
assert.equal(namedSet.size,namedSubjects.length,'Canonical subject names must be unique.');
for(const e of namedSubjects){assert(e.name.startsWith(e.root+' '));assert(!/\band\b|[&/]/i.test(e.name));assert(e.settles&&e.excludes);for(const p of e.broader_subjects||[])assert(namedSet.has(p));}
for(const r of nameAnalysis.project_bindings)for(const name of r.names)assert(namedSet.has(name));
for(const r of integration.translations)for(const name of r.subjects)assert(namedSet.has(name));
for(const r of integration.requirements){assert(namedSet.has(r.subject));if(r.related_subject)assert(namedSet.has(r.related_subject));}
assert.deepEqual(new Set(integration.development.map(r=>r.subject)),namedSet);
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
const compiled={named_subjects:namedSubjects.length,target_groups:new Set(namedSubjects.map(e=>e.parent)).size,general_headings:naming.roots.length,naming_terms:nameAnalysis.operations.length,name_changes:nameAnalysis.name_changes.length,naming_boundary_cases:nameAnalysis.boundary_cases.length,named_project_bindings:nameAnalysis.project_bindings.length,term_count:n,project_count:pn,concept_comparisons:n*n,project_kind_comparisons:pn*n,project_pair_comparisons:pn*pn,expression_rows:en,resolved_expressions:completed.filter(e=>e.heads.length).length,expression_comparisons:en*n,order_trials:completionAnalysis.orders.length,history_revisions:aboutHistory.records.length,stats,cases:cases.map(({pos,neg,...c})=>c)};
await fs.writeFile(path.join(out,'analysis-check.json'),JSON.stringify(compiled,null,2));
console.log(JSON.stringify({stage:'analysis',...compiled,cases:compiled.cases.length}));
if(process.argv.includes('--analyze-only'))process.exit(0);

const wb=Workbook.create();
const integrationSheets=['Domain Translations','Translation Links','Subject Requirements','Requirement Cases','Subject Development','Technique Evidence','Claim Review','Program Compositions','Candidate Gaps','Domain Coverage','Admission Rules','Integration Sources'];
const sheetNames=['Read Me','Subject Names','Subject Index',...integrationSheets,'Naming Terms','Name Changes','Scope Relations','Expansion Families','Named Project Work','Subject Completions','Completed Types','Expression Pairs','Order Trials','Qualification Tests','Project Subjects','About History','Wording Changes','Concepts','Type Lists','Type Matrix','Concept Pairs','Reversals','Common Parents','Project Notes','Project Lists','Project Kinds','Project Pairs','Cases','Rules','Sources'];
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
const scopeFiles={Q:'questions',P:'purposes',V:'valuation',A:'accounts',R:'arrangements',M:'availability',E:'expression',T:'activity',B:'capability',N:'inquiry',G:'general'};
const namingSource=e=>[...new Set([...e.predecessor_scopes.map(s=>`https://github.com/benjam3n/subjectsystems/blob/${naming.basis_commit}/subjects/scopes/${scopeFiles[s[0]]}.md`),sourceURLs(e.source_ids||[])])].filter(Boolean).join('\n')||'Authored definition from current user direction; see Integration Sources.';
const namedEnd=5+namedSubjects.length;
setup('Subject Names','Literal names for specified subjects','General subject first; then the target and particular determination. Each definition fixes one reading. Target groups are partial scopes; Scope Relations records refinements and actual overlap problems.', ['Subject name','Target group','General heading','Matter to settle','Does not by itself settle','Explicit broader subject','Stable subject ID','Predecessor scope references','Standing','Source basis'],namedSubjects.map(e=>[e.name,e.parent,e.root,e.settles,e.excludes,(e.broader_subjects||[]).join('; ')||'No further containment asserted',e.id,e.predecessor_scopes.join('; '),e.standing,namingSource(e)]),[48,31,20,83,79,52,61,23,27,99],{height:126});
setup('Subject Index','Find a subject by its general name','Counts and target groups reference Subject Names. The headings are not certified mutually exclusive roots. A subject-specific result remains separate from the source system that contributes it.', ['General heading','Defined scope','Named determinations','Target groups','Recorded hierarchy standing'],naming.roots.map(r=>[r.name,r.scope,null,null,r.name==='Intelligence'||r.name==='Understanding'?'Capability refinement; overlap between these aspects remains possible.':'Partial scope defined by listed matters; no universal exclusion claim.']),[24,87,23,77,77],{height:144});
for(let i=0;i<naming.roots.length;i++){const r=i+6;sh['Subject Index'].getRange(`C${r}:D${r}`).formulas=[[`=COUNTIF('Subject Names'!$C$6:$C$${namedEnd},A${r})`,`=TEXTJOIN("; ",TRUE,UNIQUE(FILTER('Subject Names'!$B$6:$B$${namedEnd},'Subject Names'!$C$6:$C$${namedEnd}=A${r},"—")))`]];}
sh['Subject Index'].getRange(`C6:C${5+naming.roots.length}`).setNumberFormat('#,##0');
setup('Naming Terms','What the determination word commits to','These terms distinguish completion conditions. Apply a term only when the target supports its meaning; do not manufacture every noun × operation combination.', ['Determination term','Completion condition','Context required','Distinction from neighboring work'],nameAnalysis.operations.map(r=>[r.term,r.completion,r.required_context,r.distinction]),[26,80,68,90],{height:100});
setup('Name Changes','Earlier wording → literal current names','Every predecessor scope and bundled parent is accounted for. Splits, target qualification, aliases, and unresolved ambiguity are distinguished from one-for-one renaming.', ['Earlier scope','Earlier name','Current names or target groups','Change relation','Reason'],nameAnalysis.name_changes.map(r=>[r.code,r.old,r.names.join('\n'),r.relation,r.reason]),[17,42,85,56,102],{height:135});
setup('Scope Relations','Names do not prove separate subjects','Constructed boundary comparisons distinguish matters, aliases, containment, and unresolved overlap. They do not certify an exhaustive exclusive hierarchy.', ['First subject','Compared subject','Relation','Separating or shared case','Consequence'],nameAnalysis.boundary_cases.map(r=>[r.a,r.b,r.relation,r.case,r.consequence]),[49,49,43,88,94],{height:112});
setup('Expansion Families','Derive further subjects from the target','The extensions follow actual target structure: versions, inputs, support, interpretation, or use. The last column records why some grammatical combinations are not completed subjects.', ['Target group','Defined extensions','What makes these subjects available','Boundary on further expansion'],nameAnalysis.expansion_families.map(r=>[r.target,r.names.join('\n'),r.reason,r.limit]),[33,71,82,93],{height:190});
setup('Named Project Work','Source contributions within the named subjects','Sixty-three contribution records: 62 proposed subject specializations or components; one conceptual target remains unspecified. Bindings retain purposes and results without implying implementation.', ['Source family','Literal subject names','Particular matter','Proposed result','Earlier project expression','Scope fit','Standing','Pinned source profile'],nameAnalysis.project_bindings.map(r=>[r.family,r.names.join('\n')||'Exact conceptual target unresolved',r.particular_matter,r.proposed_result,r.earlier_name,r.scope_fit,r.standing,projectInfo.find(p=>p.name===r.family)?.profile||'Defining source unresolved']),[27,64,82,90,67,84,82,108],{height:139});

const links=integration.translations.flatMap(r=>r.subjects.map(subject=>({id:r.id,domain:r.domain,term:r.source_term,subject,relation:r.relation,reading:r.reading,residual:r.residual,source_ids:r.source_ids})));
setup('Domain Translations','Existing terms → specified subjects','Authored translations of fixed readings. One term can split; several terms can reach one subject. Residuals prevent partial mappings from masquerading as complete equivalence.', ['Source term','Domain view','Reading examined','Actual subjects','Translation relation','Uncovered matter or restriction','Record ID','Source URLs'],integration.translations.map(r=>[r.source_term,r.domain,r.reading,r.subjects.join('\n'),r.relation,r.residual,r.id,sourceURLs(r.source_ids)]),[43,23,78,67,34,89,13,95],{height:145});
setup('Translation Links','One row per source-term / subject link','Filter by actual subject to find proposed cross-field connections. A link is a stated component or qualification; it is not a type-of assertion or proof of equivalent mechanisms.', ['Actual subject','Domain view','Source term','Translation ID','Relation','Reading examined','Residual restriction','Source URLs'],links.map(r=>[r.subject,r.domain,r.term,r.id,r.relation,r.reading,r.residual,sourceURLs(r.source_ids)]),[53,24,43,16,34,80,88,95],{height:118});
setup('Subject Requirements','Conditions have different logical force','Examined subset. Successful operation, case specification, quality, method prerequisites, justification and the condition under study are distinguished. No universal sequence is imposed.', ['Subject','Requirement kind','Condition','When it matters','Declared scope','Related subject','Reason / countercase','Requirement ID','Standing'],integration.requirements.map(r=>[r.subject,r.kind,r.condition,r.timing,r.scope,r.related_subject||'No separate subject asserted',r.reason,r.id,r.standing]),[51,36,89,28,65,52,90,17,68],{height:116});
setup('Requirement Cases','Test a supposed prerequisite','Constructed cases separate a necessary condition from a common route, truth from evidence, and common terminology from shared mechanisms.', ['Case','Situation','Consequence'],integration.requirement_cases.map(r=>[r.case,r.situation,r.consequence]),[37,89,105],{height:99});
const devEnd=5+integration.development.length,linkEnd=5+links.length;
setup('Subject Development','Development is evidence about a scoped matter','A profile exists for every subject; open assessments are not completed reviews. Sample link counts are navigation statistics, not worldwide attention, importance or neglect measures.', ['Subject','Importance context','Consequence to examine','Recognition / development standing','Attention measurement','World neglect','Technique IDs','Requirement IDs','Case parameters','Assessment standing','Catalog standing','Sample links','Sample domain views','Source URLs'],integration.development.map(r=>[r.subject,r.importance_context,r.importance_reason,r.recognition,r.attention,r.world_neglect,r.technique_ids.join('; ')||'No method review yet',r.requirements.join('; ')||'Further derivation open',r.case_parameters,r.assessment_standing,r.catalog_standing,null,null,sourceURLs(r.source_ids)]),[51,60,84,95,83,21,23,31,93,25,31,19,24,95],{height:135});
for(let i=0;i<integration.development.length;i++){const r=i+6;sh['Subject Development'].getRange(`L${r}:M${r}`).formulas=[[`=COUNTIF('Translation Links'!$A$6:$A$${linkEnd},A${r})`,`=IF(L${r}=0,0,COUNTA(UNIQUE(FILTER('Translation Links'!$B$6:$B$${linkEnd},'Translation Links'!$A$6:$A$${linkEnd}=A${r},""))))`]];}
sh['Subject Development'].getRange(`L6:M${devEnd}`).setNumberFormat('#,##0');
setup('Technique Evidence','What the inspected evidence establishes','Formal specification, implementation, observed effectiveness and transfer have separate columns. Source facts are concise; mappings and limits are authored analysis.', ['Subject','Technique','Examined scope','Formal standing','Implementation evidence','Effectiveness evidence','Transfer limit','Evidence ID','Source URLs'],integration.techniques.map(r=>[r.subject,r.technique,r.scope,r.formal,r.implementation,r.effectiveness,r.transfer,r.id,sourceURLs(r.source_ids)]),[51,50,67,83,73,88,92,15,97],{height:138});
setup('Claim Review','Specify what failed before calling it nonsense','Most rows are constructed conceptual cases. An undefined target, false claim, invalid proxy and failed method require different repairs; a precise subject survives a failed claim.', ['Complaint or label','Specified case','Standing','Useful next result','Boundary on the verdict','Basis','Source URLs'],integration.claim_review.map(r=>[r.label,r.case,r.status,r.action,r.limit,r.basis,sourceURLs(r.source_ids)]),[43,88,52,93,88,40,95],{height:124});
setup('Program Compositions','Build programs from actual subjects','These proposed programs coordinate different subject contributions. They are not new atomic subjects, already implemented custom systems, or universal workflows.', ['Program','Intended result','Subject contributions','Customization needed','Next substantive result'],integration.programs.map(r=>[r.name,r.goal,r.subjects.join('\n'),r.customization,r.next_result]),[44,78,69,101,102],{height:175});
setup('Candidate Gaps','Missing here is not the same as missing everywhere','Each row identifies a catalog omission or connection worth developing. Importance is tied to a use; novelty and global neglect remain separate questions.', ['Subject','Observed catalog gap','Why resolving it matters','Next substantive result','Novelty standing'],integration.gaps.map(r=>[r.subject,r.gap,r.importance,r.next_result,r.novelty]),[55,89,91,98,81],{height:126});
const translationEnd=5+integration.translations.length;
setup('Domain Coverage','State exactly how much was translated','The counts describe this deliberately selected sample. There is no percentage of all subjects because no complete source denominator has been reconciled.', ['Domain view','Sample terms','Subject links','Coverage scope','Untranslated content','Next coverage result','Source URLs'],integration.coverage.map(r=>[r.domain,null,null,r.scope,r.residual,r.next_result,sourceURLs(r.source_ids)]),[25,20,20,72,121,102,95],{height:140});
for(let i=0;i<integration.coverage.length;i++){const r=i+6;sh['Domain Coverage'].getRange(`B${r}:C${r}`).formulas=[[`=COUNTIF('Domain Translations'!$B$6:$B$${translationEnd},A${r})`,`=COUNTIF('Translation Links'!$B$6:$B$${linkEnd},A${r})`]];}
sh['Domain Coverage'].getRange(`B6:C${5+integration.coverage.length}`).setNumberFormat('#,##0');
setup('Admission Rules','Admit a defined matter, not a placeholder','A subject may concern an object, action, condition, property, relation or question. A negative finding does not invalidate the subject; a vague name does not define one.', ['Admission rule','What must be established'],integration.admission_rules.map(r=>[r.rule,r.test]),[47,132],{height:88});
setup('Integration Sources','Source roles and limits','Sources locate established terms or provide scoped method evidence. Canonical definitions, cross-field mappings and conceptual cases are authored analysis. The source-corpus snapshots elsewhere remain unchanged.', ['Source ID','Source title','Role','Scope and limit','Access date','Source URL'],integration.sources.map(r=>[r.id,r.title,r.kind,r.scope,r.accessed,r.url||'Current user message and supplied attachment']),[22,86,29,127,19,108],{height:120});
setup('Subject Completions','Earlier expression-completion experiment','The new Subject Names sheet supplies the current general-first names. This earlier experiment retains explicit readings and alternative index orders so its type comparisons remain auditable.', ['ID','Broad label / project','Completed expression','Declared parent kinds','Role of the broad label','Exact reading / matter considered','Standing','Source','Topic-first index','Kind-first index'],completed.map(e=>[e.id,e.root,e.label,e.heads.join('; ')||'Unresolved',e.role,e.sense,e.standing,e.source,null,null]),[9,26,49,34,34,95,81,95,71,71],{height:132});
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
intro.getRange('A1:F2').merge();intro.getRange('A1').values=[['Subject Systems — Subject Atlas']];intro.getRange('A1:F2').format={fill:ink,font:{name:'Aptos Display',size:25,bold:true,color:white},rowHeight:25,verticalAlignment:'center'};
intro.getRange('A3:F3').merge();intro.getRange('A3').values=[['Existing work → specified matters → scoped requirements → developed results.']];intro.getRange('A3:F3').format={font:{size:13,color:teal},rowHeight:34,wrapText:true};
intro.getRange('A5:B10').values=[['Current working atlas','Count'],['Defined subjects',null],['Target groups',null],['General headings',null],['Sample source terms',null],['Scoped requirements',null]];
intro.getRange('B6:B10').formulas=[[`=COUNTA('Subject Names'!$A$6:$A$${namedEnd})`],[`=COUNTA(UNIQUE('Subject Names'!$B$6:$B$${namedEnd}))`],[`=COUNTA('Subject Index'!$A$6:$A$${5+naming.roots.length})`],[`=COUNTA('Domain Translations'!$A$6:$A$${translationEnd})`],[`=COUNTA('Subject Requirements'!$A$6:$A$${5+integration.requirements.length})`]];
intro.getRange('D5:F10').values=[['Code','Meaning','Reading'],['Y','Admitted inclusion','All A are B under the stated assumptions.'],['N','Universal inclusion refuted','Do not infer that no A can also be B.'],['O','Overlap plus counterexample','Some overlap is demonstrated; not all A are B.'],['?','Open','Insufficient grounds; not a disguised No.'],['S','Identity','Self-comparison only.']];
for(const range of ['A5:B5','D5:F5'])intro.getRange(range).format={fill:teal,font:{bold:true,color:white},rowHeight:28};
intro.getRange('A6:F10').format={wrapText:true,rowHeight:43,verticalAlignment:'center'};intro.getRange('B6:B10').setNumberFormat('#,##0');intro.getRange('B6:B10').format.font={size:19,bold:true,color:teal};
const notes=[
 ['Start with Subject Names','Literal general-first names define the matter and distinguish nearby work. Subject Index supplies navigation. Admission Rules states what a real entry must establish.'],
 ['Translate established terms','Domain Translations fixes the reading and records residual content. Translation Links gives one row per connection so you can find several fields contributing to the same subject.'],
 ['Conditions can be subjects','Reasoning approach availability remains investigable when no approach is available. Successful selection requires a candidate at choice time; it does not always require a separate retrieval step.'],
 ['Requirements have different force','Subject Requirements separates necessary conditions, case parameters, quality, method prerequisites, evidence requirements and conditions under study. Requirement Cases tests overstrong claims.'],
 ['Development needs scoped evidence','Subject Development has a profile for every name. Open assessments are explicit. Technique Evidence separates formal specification, implementation, observed performance and transfer.'],
 ['Do not infer neglect from a new name','Attention requires aliases, a corpus, period and denominator. Sample link counts describe this workbook. Candidate Gaps distinguishes catalog omissions from unresolved global novelty or neglect.'],
 ['Preserve domain-specific matters','An LLM computation is not identified with human attention. Mathematical rotation, an internal process and measured response time are distinct. Scope Relations records the cases.'],
 ['Build programs from contributions','Program Compositions develops retention, reasoning, engineering and other programs from exact subjects. Named Project Work retains the existing source-family contributions and their implementation limits.'],
 ['Review the actual failed claim or method','Claim Review separates undefined targets, conflated bundles, unsupported claims, invalid proxies and scoped method failures. A false claim can belong to a precise, useful subject.'],
 ['Coverage is representative','Domain Coverage states what remains untranslated. The broad headings are not certified exclusive peers. Integrating all existing descendants would require versioned source inventories and residual reconciliation.'],
 ['Earlier work remains auditable','The earlier type matrices, qualification rules and source history retain their stated meanings. Counts are formulas; prose definitions and their consequences still require semantic review.']
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
 'Read Me':'A1:F37','Subject Names':'A1:E9','Subject Index':'A1:E8','Naming Terms':'A1:D9','Name Changes':'A1:E8','Scope Relations':'A1:E8','Expansion Families':'A1:D7','Named Project Work':'A1:D8','Subject Completions':'A1:F8','Completed Types':'A1:E7','Expression Pairs':'A1:F8','Order Trials':'A1:F8','Qualification Tests':'A1:F8','Project Subjects':'A1:F8','About History':'A1:F8','Wording Changes':'A1:E7','Concepts':'A1:D9','Type Lists':'A1:D7','Type Matrix':'A1:K16','Concept Pairs':'A1:H8','Reversals':'A1:F7','Common Parents':'A1:E8','Project Notes':'A1:F7','Project Lists':'A1:D7','Project Kinds':'A1:F8','Project Pairs':'A1:F7','Cases':'A1:D8','Rules':'A1:E8','Sources':'A1:E7'
};
Object.assign(renderRanges,{'Domain Translations':'A1:D9','Translation Links':'A1:F9','Subject Requirements':'A1:D9','Requirement Cases':'A1:C9','Subject Development':'A1:D9','Technique Evidence':'A1:D9','Claim Review':'A1:D9','Program Compositions':'A1:D8','Candidate Gaps':'A1:D9','Domain Coverage':'A1:E9','Admission Rules':'A1:B10','Integration Sources':'A1:D9'});
const changedSheets=new Set(['Read Me','Subject Names','Subject Index','Naming Terms','Scope Relations',...integrationSheets]);
for(const name of sheetNames){if(process.env.SUBJECT_NAMES_CHANGED_ONLY==='1'&&!changedSheets.has(name))continue;const blob=await wb.render({sheetName:name,range:renderRanges[name],scale:1,format:'png'});await fs.writeFile(path.join(out,`preview-${name.replaceAll(' ','-')}.png`),new Uint8Array(await blob.arrayBuffer()));console.log(`Rendered ${name}`);}
const file=await SpreadsheetFile.exportXlsx(wb);await file.save(path.join(out,'Subject_Type_Relations.xlsx'));
console.log(JSON.stringify({stage:'exported',file:path.join(out,'Subject_Type_Relations.xlsx'),sheets:sheetNames.length,namedSubjects:namedSubjects.length,namingBoundaryCases:nameAnalysis.boundary_cases.length,concepts:n,projects:pn,expressions:en,resolvedExpressions:completed.filter(e=>e.heads.length).length,expressionComparisons:en*n,historyRevisions:aboutHistory.records.length,cases:cases.length,reversals:exploration.reversals.length}));
