function simulate(weights, N=300000){
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
const tests = [
  [50,40,100,80,30],
  [40,20,20,10,10],
  [45,20,20,10,5],
  [50,20,15,10,5],
  [60,15,10,10,5],
  [55,15,15,10,5],
  [35,25,25,10,5],
];
for(const w of tests){
  const p = simulate(w, 200000);
  console.log(JSON.stringify(w), ' -> p_any_win ˜', p.toFixed(4));
}
