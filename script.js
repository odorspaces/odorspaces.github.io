import { offlineViewers } from './offline/viewers.mjs?v=3e09f305934c';
import { comparisonVideos } from './media-config.mjs?v=c930008e180e';
import { failureCases } from './failure-config.mjs?v=d4836a75feaf';
// The two self-contained exports already contain their scene and volume data.
document.querySelectorAll('[data-offline]').forEach(button=>button.addEventListener('click',()=>{
  const scenario=button.dataset.offline;
  document.querySelectorAll('[data-offline]').forEach(item=>{const selected=item===button;item.classList.toggle('selected',selected);item.setAttribute('aria-pressed',String(selected));});
  document.getElementById('offline-viewer').src=offlineViewers[scenario];
  document.getElementById('offline-viewer').title=`${scenario==='propane'?'Propane gas leak: C₃H₈':'Methanol pool fire: CO₂'} dispersion, interactive offline 3D volume visualization`;
}));

const byId=(id)=>document.getElementById(id);
byId('project-video').querySelector('video').addEventListener('error',()=>{const note=document.createElement('p');note.textContent='The project video could not be loaded. Please try again later.';byId('project-video').replaceChildren(note);});
let feedbackTimer;
byId('copy-citation').addEventListener('click',async()=>{const code=byId('bibtex'),feedback=byId('copy-feedback');clearTimeout(feedbackTimer);try{await navigator.clipboard.writeText(code.textContent);feedback.textContent='Citation copied.';}catch{const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);feedback.textContent='Citation selected. Press ⌘C or Ctrl+C to copy.';}feedbackTimer=setTimeout(()=>feedback.textContent='',6000);});

// Main comparisons and failure cases have independent playback lifecycles.
let activeGroups=[];
const failureGroups=[];
function episodeRow(task,episode,exampleIndex,groups=activeGroups){
  const sceneName=episode.scene??task.scene,topView=episode.topView??task.topView;
  const row=document.createElement('article');row.className=`episode-row${episode.title?' failure-row':''}`;
  const dimensions=episode.videos.find(video=>video.width&&video.height);
  if(dimensions)row.style.setProperty('--comparison-aspect',`${dimensions.width}/${dimensions.height}`);
  const heading=document.createElement('h3');heading.textContent=episode.title??`Example ${exampleIndex+1}${episode.dataset?` · ${episode.dataset==='mp3d'?'Matterport3D':'Replica'}`:''}`;
  const scroll=document.createElement('div');scroll.className='episode-scroll';scroll.tabIndex=0;scroll.setAttribute('aria-label',`${heading.textContent}: scene and ${episode.videos.length} agent recordings`);
  const grid=document.createElement('div');grid.className='episode-grid';
  const scene=document.createElement('figure');scene.className='scene-tile';
  if(episode.rotationDegrees===90)scene.classList.add('rotated-scene');
  const caption=document.createElement('figcaption');caption.textContent='Scene · top view';
  const link=document.createElement('a');link.href=topView;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',`Enlarge ${sceneName} top view`);
  const image=document.createElement('img');image.src=topView;image.alt=`Top view of ${sceneName.replaceAll('_',' ')} with a cyan start circle and yellow target diamond`;image.loading='lazy';link.append(image);scene.append(caption,link);
  const legend=document.createElement('p');legend.className='scene-legend';
  for(const [kind,label] of [['start','Start Pos'],['target','Target Pos']]){
    const item=document.createElement('span'),symbol=document.createElementNS('http://www.w3.org/2000/svg','svg');
    symbol.classList.add('scene-key');symbol.setAttribute('viewBox','-28 -28 56 56');symbol.setAttribute('aria-hidden','true');
    const shape=document.createElementNS('http://www.w3.org/2000/svg',kind==='start'?'circle':'polygon');
    if(kind==='start'){shape.setAttribute('r','19');}else{shape.setAttribute('points','0,-23 23,0 0,23 -23,0');}
    shape.setAttribute('fill',kind==='start'?'#00ffff':'#ffff00');shape.setAttribute('stroke','#000000');shape.setAttribute('stroke-width','6');symbol.append(shape);
    item.append(symbol,document.createTextNode(`: ${label}`));legend.append(item);
  }
  scene.append(legend);grid.append(scene);
  const videos=[],results=[];
  for(const recording of episode.videos){
    const tile=document.createElement('figure');tile.className='agent-tile';tile.dataset.agent=recording.agent;
    const label=document.createElement('figcaption');label.textContent=recording.label;
    const media=document.createElement('div');media.className='agent-media';
    if(recording.src){
      const video=document.createElement('video');video.src=recording.src;video.poster=recording.poster;video.controls=true;video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',`${recording.label}, example ${exampleIndex+1}`);media.append(video);videos.push(video);
      // Show the recorded episode outcome when its displayed clip finishes,
      // including excerpts trimmed to the demo's time limit.
      if(typeof recording.stopSuccess==='boolean'){
        const result=document.createElement('span');result.className=`video-result ${recording.stopSuccess?'success':'fail'}`;result.textContent=recording.stopSuccess?'Success':'Fail';result.hidden=true;result.setAttribute('role','status');result.setAttribute('aria-label',`${recording.label}: ${result.textContent}`);media.append(result);
        let reset=true;
        const update=()=>{
          // A queued `ended` event may belong to the previous playback. Use
          // the current position, and wait for a seek's final frame to load.
          const atEnd=video.currentTime>0&&video.currentTime>=video.duration-1e-3;
          result.hidden=reset||video.seeking||Boolean(video.error)||video.readyState<2||!Number.isFinite(video.duration)||!atEnd;
        };
        const seekResult=value=>{reset=value===0;result.hidden=true;};
        video.addEventListener('play',()=>{reset=false;update();});
        video.addEventListener('seeking',()=>{seekResult(video.currentTime);update();});
        video.addEventListener('emptied',()=>{seekResult(0);});
        for(const event of ['ended','timeupdate','seeked','loadeddata','canplay','durationchange','error'])video.addEventListener(event,update);
        results.push({seek:seekResult,update});
      }
    }
    else{const missing=document.createElement('p');missing.className='missing-video';missing.textContent='Recording unavailable';media.append(missing);}
    const metric=document.createElement('p');metric.className='episode-spl';metric.textContent=Number.isFinite(recording.spl)?`SPL ${(recording.spl*100).toFixed(1)}%`:'SPL unavailable';
    tile.append(label,media,metric);grid.append(tile);
  }
  scroll.append(grid);
  const controls=document.createElement('div');controls.className='comparison-controls';
  const play=document.createElement('button');play.type='button';play.textContent='▶ Play all';play.disabled=true;
  const restart=document.createElement('button');restart.type='button';restart.textContent='↺ Restart';restart.disabled=true;
  const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=0;slider.step=.01;slider.value=0;slider.disabled=true;slider.setAttribute('aria-label',`Example ${exampleIndex+1} video time`);
  const output=document.createElement('output');output.textContent='0.0 s';
  const status=document.createElement('p');status.className='episode-status';status.setAttribute('role','status');status.textContent=videos.length?'Loading recordings…':'Episode recordings are not yet available.';
  controls.append(play,restart,slider,output);row.append(heading);
  if(episode.context){const context=document.createElement('p');context.className='failure-context';context.textContent=episode.context;row.append(context);}
  if(episode.description){const description=document.createElement('p');description.className='failure-description';description.textContent=episode.description;row.append(description);}
  row.append(scroll,controls,status);
  let playing=false,starting=false,duration=0,time=0,pending=0,failed=false,startAbort=null;
  let scrubbing=false,resumeAfterSeek=false,nativeVideo=null;
  function pause(except=null){pending++;playing=starting=false;startAbort?.abort();startAbort=null;videos.forEach(v=>{if(v!==except)v.pause();});play.textContent='▶ Play all';}
  function showTime(value){time=Math.max(0,Math.min(value,duration));slider.value=time;output.textContent=`${time.toFixed(1)} s`;}
  function waitForSeek(video,signal){
    if(!video.seeking||signal.aborted)return Promise.resolve();
    return new Promise(resolve=>{
      const events=['seeked','error','emptied'];
      const done=()=>{events.forEach(event=>video.removeEventListener(event,done));signal.removeEventListener('abort',done);resolve();};
      events.forEach(event=>video.addEventListener(event,done));signal.addEventListener('abort',done,{once:true});
      if(!video.seeking||signal.aborted)done();
    });
  }
  function seek(value){nativeVideo=null;showTime(value);results.forEach(result=>result.seek(time));videos.forEach(v=>{if(Number.isFinite(v.duration))v.currentTime=Math.min(time,v.duration);});results.forEach(result=>result.update());}
  function ready(){if(!failed&&videos.length&&videos.every(v=>v.readyState>=1&&Number.isFinite(v.duration))){duration=Math.max(...videos.map(v=>v.duration));slider.max=duration;play.disabled=restart.disabled=slider.disabled=false;status.textContent='';}}
  for(const video of videos){video.addEventListener('loadedmetadata',ready);video.addEventListener('error',()=>{failed=true;pause();play.disabled=restart.disabled=slider.disabled=true;status.textContent='A recording could not be loaded. Reload to try again.';});}
  async function start(){
    scrubbing=resumeAfterSeek=false;
    [...activeGroups,...failureGroups].forEach(g=>g.pause());
    // Rejoin every clip at the selected time, including after native seeking.
    seek(time>=duration?0:time);const request=++pending;
    const controller=new AbortController();startAbort=controller;starting=true;play.textContent='❚❚ Pause all';status.textContent='';
    try{
      await Promise.all(videos.filter(v=>time<v.duration).map(async v=>{
        await waitForSeek(v,controller.signal);
        // Some decoders land on the end when seeking inside the final frame.
        // Calling play() there would rewind that clip to zero.
        if(request!==pending)return;
        if(v.ended||v.currentTime>=v.duration-1e-3){v.currentTime=v.duration;return;}
        try{await v.play();}
        catch(error){
          // A one-frame recording can finish before its play promise settles.
          // Its normal ending must not cancel the other, longer recordings.
          if(error.name!=='AbortError'||!v.ended||v.error)throw error;
        }
      }));
      // A superseded start must never pause a newer run on these same videos.
      if(request!==pending)return;
      startAbort=null;starting=false;playing=true;
    }
    catch{if(request!==pending)return;pause();status.textContent='Playback could not start. Try Play all again.';}
  }
  play.addEventListener('click',()=>{if(playing||starting){pause();return;}start();});
  restart.addEventListener('click',()=>{scrubbing=resumeAfterSeek=false;pause();seek(0);});
  function beginScrub(){
    if(scrubbing)return;
    resumeAfterSeek=playing||starting||videos.some(v=>!v.paused&&!v.ended);
    scrubbing=true;pause();nativeVideo=null;
  }
  function finishScrub(){
    if(!scrubbing)return;
    const resume=resumeAfterSeek&&time<duration;
    scrubbing=resumeAfterSeek=false;
    if(resume)start();
  }
  slider.addEventListener('pointerdown',beginScrub);
  slider.addEventListener('input',()=>{const value=Number(slider.value);beginScrub();seek(value);});
  for(const event of ['change','pointerup','pointercancel','blur'])slider.addEventListener(event,finishScrub);
  // Native controls own the selected clip. Preserve its playback state while
  // stopping the other clips, so a native timeline drag can resume normally.
  for(const video of videos){
    for(const event of ['pointerdown','keydown'])video.addEventListener(event,()=>{
      scrubbing=resumeAfterSeek=false;
      if(playing||starting)pause(video);
      nativeVideo=video;
    });
    for(const event of ['seeking','seeked','timeupdate'])video.addEventListener(event,()=>{
      if(nativeVideo===video&&!scrubbing&&!playing&&!starting)showTime(video.currentTime);
    });
  }
  const group={pause,dispose(){pause();videos.forEach(v=>{v.removeAttribute('src');v.load();});},update(){
    if(!playing)return;
    // Follow actual media progress. A wall clock must not seek a buffering or
    // slower recording to its end and prematurely announce its outcome.
    const unfinished=videos.filter(v=>v.seeking||v.currentTime<v.duration-1e-3);
    time=unfinished.length?Math.min(...unfinished.map(v=>v.currentTime)):duration;
    slider.value=time;output.textContent=`${time.toFixed(1)} s`;
    results.forEach(result=>result.update());
    // The last timestamp can arrive before the browser marks a clip ended.
    // Pausing in that gap suppresses its native completion; let every clip end.
    if(!unfinished.length&&videos.every(v=>v.ended))pause();
  }};
  groups.push(group);ready();return row;
}
function selectComparison(key){
  activeGroups.forEach(group=>group.dispose());activeGroups=[];
  document.querySelectorAll('[data-comparison]').forEach(button=>{const selected=button.dataset.comparison===key;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  byId('comparison-episodes').dataset.task=key;
  const task=comparisonVideos[key];
  byId('comparison-episodes').replaceChildren(...task.episodes.map((episode,index)=>episodeRow(task,episode,index)));
}
document.querySelectorAll('[data-comparison]').forEach(button=>button.addEventListener('click',()=>selectComparison(button.dataset.comparison)));
document.addEventListener('visibilitychange',()=>{if(document.hidden)[...activeGroups,...failureGroups].forEach(g=>g.pause());});
function update(now){[...activeGroups,...failureGroups].forEach(g=>g.update(now));requestAnimationFrame(update);}requestAnimationFrame(update);selectComparison('gas');
byId('failure-episodes').replaceChildren(...failureCases.map((episode,index)=>episodeRow({},episode,index,failureGroups)));
