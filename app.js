/* ========== Helpers ========== */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function toInt(v, d = 0){ const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : d; }
function pow2(p){ return 1n << BigInt(p); } // 2^p (BigInt)
function roundTo(x, d){ const f = Math.pow(10, d); return Math.round(x * f) / f; }
function csvDownload(name, rows){
  const data = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([data], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=name; a.click();
  URL.revokeObjectURL(url);
}

/* ========== Core RNG ========== */
const nextLCG = (x,a,c,m) => (a*x + c) % m;
const nextMCG = (x,a,m)   => (a*x) % m;

/* ========== Checks (m=2^P) ========== */
function lcgHint(a, c, m){
  const okC = (c % 2n === 1n);           // c impar → gcd(c, 2^P)=1
  const okA = ((a - 1n) % 4n === 0n);    // a ≡ 1 (mod 4)
  if(okC && okA) return {ok:true, msg:"Hull–Dobell OK (m=2^P): c impar y a≡1 (mod 4)."};
  const parts=[]; if(!okC) parts.push("usa c impar"); if(!okA) parts.push("a≡1 (mod 4)");
  return {ok:false, msg:"Revisa parámetros: " + parts.join(" y ") + "."};
}
function mcgHint(a, m, x0){
  const okA = ((a - 3n) % 8n === 0n);    // a = 8K+3
  const okS = (x0 % 2n === 1n);          // semilla impar (coprima con 2^P)
  if(okA && okS) return {ok:true, msg:"MCG OK: a=8K+3 y semilla impar."};
  const parts=[]; if(!okA) parts.push("a=8K+3"); if(!okS) parts.push("semilla impar");
  return {ok:false, msg:"Revisa parámetros: " + parts.join(" y ") + "."};
}

/* ========== UI render ========== */
function renderRows(tbody, rows){
  tbody.innerHTML = "";
  const frag = document.createDocumentFragment();
  rows.forEach(r=>{
    const tr = document.createElement("tr");
    r.forEach(c => { const td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

/* ========== LCG ========== */
function runLCG(){
  const x0 = toInt($("#lcg-x0").value);
  const K  = toInt($("#lcg-k").value);
  const cI = toInt($("#lcg-c").value);
  const P  = toInt($("#lcg-p").value);
  const D  = toInt($("#lcg-d").value, 4);
  const N  = Math.max(1, toInt($("#lcg-n").value, 10));

  if(P < 2){ setHint("#lcg-hint","P debe ser ≥ 2", false); return; }

  const a   = 1n + 4n*BigInt(K);
  const m   = pow2(P);
  const c   = BigInt(cI);
  const x0B = BigInt(x0);

  if(x0B < 0n || x0B >= m){ setHint("#lcg-hint","X0 debe cumplir 0 ≤ X0 < 2^P", false); return; }

  const chk = lcgHint(a,c,m);
  setHint("#lcg-hint", chk.msg, chk.ok);

  let x = x0B;
  const rows = [];
  const csv  = [["i","Xi-1","Operacion","Xi","ri"]];

  for(let i=1;i<=N;i++){
    const Xi_1 = x;
    const Xi   = nextLCG(Xi_1, a, c, m);
    const ri   = Number(Xi) / Number(m - 1n);

    const op = `(${a.toString()} · ${Xi_1.toString()} + ${c.toString()}) mod ${m.toString()}`;
    const riStr = roundTo(ri, D).toFixed(D);

    rows.push([i, Xi_1.toString(), op, Xi.toString(), riStr]);
    csv.push ([i, Xi_1.toString(), op, Xi.toString(), riStr]);

    x = Xi;
  }

  renderRows($("#lcg-tbody"), rows);
  $("#lcg-csv").onclick = () => csvDownload("lcg.csv", csv);
}

function clearLCG(){
  $("#lcg-x0").value=""; $("#lcg-k").value=""; $("#lcg-c").value="";
  $("#lcg-p").value="";  $("#lcg-d").value="4"; $("#lcg-n").value="10";
  $("#lcg-hint").textContent=""; $("#lcg-hint").className="hint";
  $("#lcg-tbody").innerHTML="";
}

/* ========== MCG ========== */
function runMCG(){
  const x0 = toInt($("#mcg-x0").value);
  const K  = toInt($("#mcg-k").value);
  const P  = toInt($("#mcg-p").value);
  const D  = toInt($("#mcg-d").value, 4);
  const N  = Math.max(1, toInt($("#mcg-n").value, 10));

  if(P < 2){ setHint("#mcg-hint","P debe ser ≥ 2", false); return; }

  const a   = 8n*BigInt(K) + 3n;
  const m   = pow2(P);
  const x0B = BigInt(x0);

  if(x0B < 0n || x0B >= m){ setHint("#mcg-hint","X0 debe cumplir 0 ≤ X0 < 2^P", false); return; }

  const chk = mcgHint(a,m,x0B);
  setHint("#mcg-hint", chk.msg, chk.ok);

  let x = x0B;
  const rows = [];
  const csv  = [["i","Xi-1","Operacion","Xi","ri"]];

  for(let i=1;i<=N;i++){
    const Xi_1 = x;
    const Xi   = nextMCG(Xi_1, a, m);
    const ri   = Number(Xi) / Number(m - 1n);

    const op = `(${a.toString()} · ${Xi_1.toString()}) mod ${m.toString()}`;
    const riStr = roundTo(ri, D).toFixed(D);

    rows.push([i, Xi_1.toString(), op, Xi.toString(), riStr]);
    csv.push ([i, Xi_1.toString(), op, Xi.toString(), riStr]);

    x = Xi;
  }

  renderRows($("#mcg-tbody"), rows);
  $("#mcg-csv").onclick = () => csvDownload("mcg.csv", csv);
}

function clearMCG(){
  $("#mcg-x0").value=""; $("#mcg-k").value=""; $("#mcg-p").value="";
  $("#mcg-d").value="4"; $("#mcg-n").value="10";
  $("#mcg-hint").textContent=""; $("#mcg-hint").className="hint";
  $("#mcg-tbody").innerHTML="";
}

/* ========== Utils UI ========== */
function setHint(sel, msg, ok){
  const el = $(sel);
  el.textContent = msg;
  el.className = "hint " + (ok ? "ok" : "bad");
}

/* ========== Bindings ========== */
window.addEventListener("DOMContentLoaded", ()=>{
  $("#lcg-run").addEventListener("click", runLCG);
  $("#lcg-csv").addEventListener("click", ()=>{}); // asignado tras generar
  $("#lcg-clear").addEventListener("click", clearLCG);

  $("#mcg-run").addEventListener("click", runMCG);
  $("#mcg-csv").addEventListener("click", ()=>{});
  $("#mcg-clear").addEventListener("click", clearMCG);
});
