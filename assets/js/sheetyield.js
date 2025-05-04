(function () {

  const svgNS = 'http://www.w3.org/2000/svg';

  const SHEETS = [
    { label: '4×8 ft (48×96″)',  w: 48,  h: 96 },
    { label: '5×5 ft (60×60″)',  w: 60,  h: 60 },
    { label: '5×10 ft (60×120″)', w: 60, h: 120 }
  ];

  /* SVG helpers */
  function createSvg(w,h){
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    svg.setAttribute('width','100%');
    svg.classList.add('wwt-sheet-svg');
    svg.style.border = '1px solid #999';
    return svg;
  }
  function rect(x,y,w,h,color,id){
    const g = document.createElementNS(svgNS,'g');
    const r = document.createElementNS(svgNS,'rect');
    r.setAttribute('x',x); r.setAttribute('y',y);
    r.setAttribute('width',w); r.setAttribute('height',h);
    r.setAttribute('fill',color);
    r.setAttribute('stroke','#000');
    r.setAttribute('stroke-width','0.5');
    g.appendChild(r);
    const t = document.createElementNS(svgNS,'text');
    t.setAttribute('x',x+1.5); t.setAttribute('y',y+6);
    t.setAttribute('font-size','6');
    t.textContent = id;
    g.appendChild(t);
    return g;
  }

  /* kick off each calculator */
  document
    .querySelectorAll('[data-wwt-component="sheet-yield"]')
    .forEach(init);

  function init(root){
    const sheetSel  = root.querySelector('[data-sheet]');
    const customDiv = root.querySelector('.wwt-custom-sheet');
    const tbody     = root.querySelector('[data-rows]');
    const addBtn    = root.querySelector('[data-add-row]');
    const kerfInp   = root.querySelector('[data-kerf]');
    const rotateCB  = root.querySelector('[data-rotate]');
    const output    = root.querySelector('[data-output]');
    const legendBox = root.querySelector('[data-legend]');
    const sheetCnt  = root.querySelector('[data-sheet-count]');

    // 1) presets
    SHEETS.forEach(s=>{
      sheetSel.insertAdjacentHTML(
        'beforeend',
        `<option value="${s.w}x${s.h}">${s.label}</option>`
      );
    });
    // 2) custom option
    sheetSel.insertAdjacentHTML(
      'beforeend',
      `<option value="custom">Custom…</option>`
    );

    // 3) toggle custom inputs
    sheetSel.addEventListener('change',()=>{
      customDiv.style.display =
        sheetSel.value==='custom' ? 'block' : 'none';
      calc();
    });

    // row factory
    function makeRow(){
      const tr = document.createElement('tr');
      tr.innerHTML =
        `<td><input size="4" data-w></td>` +
        `<td><input size="4" data-h></td>` +
        `<td><input size="4" data-q value="1"></td>` +
        `<td><input type="checkbox" data-grain title="Lock grain"></td>` +
        `<td><button type="button" class="wwt-remove" title="Remove">×</button></td>`;
      return tr;
    }

    // events
    addBtn.addEventListener('click',()=>{
      tbody.appendChild(makeRow());
      calc();
    });
    root.addEventListener('input', calc);
    root.addEventListener('change', calc);
    tbody.addEventListener('click', e=>{
      if(e.target.classList.contains('wwt-remove')){
        e.target.closest('tr').remove();
        calc();
      }
    });

    // first row + initial calc
    tbody.appendChild(makeRow());
    calc();

    // main packing & draw
    function calc(){
      output.innerHTML    = '';
      legendBox.innerHTML = '';
      sheetCnt.textContent= '0';

      // collect parts
      const parts    = [];
      const legendMap= new Map();
      tbody.querySelectorAll('tr').forEach((tr,i)=>{
        const w = +tr.querySelector('[data-w]').value    || 0;
        const h = +tr.querySelector('[data-h]').value    || 0;
        const q = +tr.querySelector('[data-q]').value    || 0;
        const g =  tr.querySelector('[data-grain]').checked;
        if(w&&h&&q){
          const id = 'P'+(i+1);
          legendMap.set(id,{w,h,qty:q});
          for(let n=0;n<q;n++) parts.push({id,w,h,grain:g});
        }
      });
      if(!parts.length) return;

      // legend
      const ul = document.createElement('ul');
      legendMap.forEach((v,id)=>{
        const li = document.createElement('li');
        li.textContent = `${id}: ${v.w}×${v.h} in (qty ${v.qty})`;
        ul.appendChild(li);
      });
      legendBox.appendChild(ul);

      // sheet dims
      let SW,SH;
      if(sheetSel.value==='custom'){
        SW = parseFloat(root.querySelector('[data-custom-w]').value)||0;
        SH = parseFloat(root.querySelector('[data-custom-h]').value)||0;
      } else {
        [SW,SH] = sheetSel.value.split('x').map(Number);
      }
      const kerf = parseFloat(kerfInp.value)||0;

      // pack
      const sheets = [];
      parts.forEach(p=>{
        let placed=false;
        for(const s of sheets){
          let node = s.insert(p.w,p.h,p);
          if(!node&&rotateCB.checked&&!p.grain)
            node = s.insert(p.h,p.w,p);
          if(node){ placed=true; break; }
        }
        if(!placed){
          const bp = new BinPack(SW,SH,kerf);
          let node = bp.insert(p.w,p.h,p);
          if(!node&&rotateCB.checked&&!p.grain)
            node = bp.insert(p.h,p.w,p);
          if(node) sheets.push(bp);
        }
      });

      sheetCnt.textContent = sheets.length;

      // draw sheets
      sheets.forEach((s,idx)=>{
        const svg = createSvg(SW,SH);
        s.used.forEach(u=>{
          const hue   = (u.data.id.charCodeAt(0)*57)%360;
          const color = `hsl(${hue} 70% 75%)`;
          svg.appendChild(rect(u.x,u.y,u.w,u.h,color,u.data.id));
        });
        const wrap = document.createElement('div');
        wrap.className = 'wwt-sheet-wrap';
        wrap.innerHTML= `<p>Sheet ${idx+1}</p>`;
        wrap.appendChild(svg);
        output.appendChild(wrap);
      });
    }
  }

})();
