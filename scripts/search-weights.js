function simulate(weights, N=150000){
  const total = weights.reduce((a,b)=>a+b,0);
  const probs = weights.map(w=>w/total);
  function draw(){
    const r = Math.random();
    let cum=0;
    for(let i=0;i<probs.length;i++){ cum+=probs[i]; if(r<cum) return i; }
    return probs.length-1;
  }
  function spin(){
    const g = Array.from({length:3},()=>Array.from({length:3},()=>draw()))
    const eq3 = (a,b,c)=> a===b && b===c;
    let win=false;
    for(let r=0;r<3;r++) if(eq3(g[r][0],g[r][1],g[r][2])) win=true;
    for(let c=0;c<3;c++) if(eq3(g[0][c],g[1][c],g[2][c])) win=true;
    if(eq3(g[0][0],g[1][1],g[2][2])) win=true;
    if(eq3(g[0][2],g[1][1],g[2][0])) win=true;
    return win;
  }
  let wins=0;
  for(let i=0;i<N;i++){ if(spin()) wins++; }
  return wins/N;
}
let best=null; let target=0.49;
for(let a of [38,39,40,41,42,43,44]){
  for(let b of [18,19,20,21,22,23,24]){
    for(let c of [15,18,19,20,21]){
      for(let d of [8,9,10,11,12]){
        for(let e of [6,7,8,9,10]){
          const w=[a,b,c,d,e];
          const p=simulate(w, 100000);
          const err=Math.abs(p-target);
          if(!best || err<best.err){ best={w,p,err}; console.log('candidate', w, p.toFixed(4)); }
        }
      }
    }
  }
}
console.log('best', best);
