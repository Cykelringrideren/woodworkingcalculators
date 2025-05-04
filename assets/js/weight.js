(() => {
  // --- Default species (lb/ft3) ---
  const DEFAULT_SPECIES = [
    { name: 'White Oak',    density: 47   },
    { name: 'Hard Maple',   density: 44   },
    { name: 'Cherry',       density: 36   },
    { name: 'Black Walnut', density: 38   },
    { name: 'Pine (SPF)',   density: 28   },
  ];

  // --- Converters ---
  const toInches = str => {
    if (!str) return 0;
    let m;
    if (m = str.match(/^([\d.]+)\s*mm$/i)) return parseFloat(m[1]) / 25.4;
    if (m = str.match(/^([\d.]+)\s*m$/i))  return parseFloat(m[1]) * 39.3701;
    if (m = str.match(/^([\d.]+)\s*ft$/i)) return parseFloat(m[1]) * 12;
    if (m = str.match(/^([\d.]+)\s*in$/i)) return parseFloat(m[1]);
    return parseFloat(str) || 0;  // assume inches
  };
  const toMm = str => {
    if (!str) return 0;
    let m;
    if (m = str.match(/^([\d.]+)\s*ft$/i)) return parseFloat(m[1]) * 304.8;
    if (m = str.match(/^([\d.]+)\s*m$/i))  return parseFloat(m[1]) * 1000;
    if (m = str.match(/^([\d.]+)\s*in$/i)) return parseFloat(m[1]) * 25.4;
    if (m = str.match(/^([\d.]+)\s*mm$/i)) return parseFloat(m[1]);
    return parseFloat(str) || 0;  // assume mm
  };

  // Imperial: board-feet & pounds
  const bfCalc   = (t,w,l) => t * w * l / 12;       
  const lbFromBF = (bf,d)   => bf * (d/12);        

  // Metric: cubic meters & kilograms
  const m3Calc   = (t,w,l) => (t/1000)*(w/1000)*(l/1000); 
  const kgFromM3 = (m3,d)   => m3 * d;                     

  document.querySelectorAll('[data-wwt-component="weight"]').forEach(init);

  function init(root) {
    const unitRadios = root.querySelectorAll('[data-unit-system]');
    const speciesSel = root.querySelector('[data-species]');
    const tbody      = root.querySelector('tbody[data-rows]');
    const addBtn     = root.querySelector('[data-add-row]');
    const volTotal   = root.querySelector('[data-total-vol]');
    const wtTotal    = root.querySelector('[data-total-wt]');
    const volUnitEl  = root.querySelector('[data-vol-unit]');
    const wtUnitEl   = root.querySelector('[data-wt-unit]');

    // Populate species + “add custom” option
    function populateSpecies(sys) {
      speciesSel.innerHTML = '';
      const unitLabel = sys === 'imperial' ? 'lb/ft³' : 'kg/m³';
      DEFAULT_SPECIES.forEach(sp => {
        // compute the density in the correct unit
        const d = sys === 'imperial'
          ? sp.density
          : +(sp.density * 16.018463).toFixed(0);
        speciesSel.insertAdjacentHTML('beforeend',
          `<option value="${d}">${sp.name} (${d} ${unitLabel})</option>`);
      });
      speciesSel.insertAdjacentHTML('beforeend',
        `<option value="" data-custom>+ Add custom…</option>`);
    }

    // Initial population
    let unitSystem = () => root.querySelector('[data-unit-system]:checked').value;
    populateSpecies(unitSystem());

    // Toggle placeholder & units whenever the user changes system
    unitRadios.forEach(r => r.addEventListener('change', () => {
      const sys = unitSystem();
      // update species list
      populateSpecies(sys);
      // update column header
      root.querySelector('[data-vol-header]').textContent =
        sys === 'imperial' ? 'Bd Ft' : 'm³';
      // update unit labels
      volUnitEl.textContent = sys === 'imperial' ? 'bd ft' : 'm³';
      wtUnitEl.textContent  = sys === 'imperial' ? 'lb'    : 'kg';
      // update placeholders on each row
      tbody.querySelectorAll('tr').forEach(tr => {
        tr.querySelector('[data-field="t"]').placeholder =
          sys === 'imperial' ? 'Thickness (in)' : 'Thickness (mm)';
        tr.querySelector('[data-field="w"]').placeholder =
          sys === 'imperial' ? 'Width (in)' : 'Width (mm)';
        tr.querySelector('[data-field="l"]').placeholder =
          sys === 'imperial'
            ? 'Length (ft/in, e.g. “8 ft” or “96 in”)'
            : 'Length (m/mm, e.g. “2 m” or “2000 mm”)';
      });
      recalc();
    }));

    // “Add board” button
    addBtn.addEventListener('click', () => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input data-field="t" /></td>
        <td><input data-field="w" /></td>
        <td><input data-field="l" /></td>
        <td data-out-vol>0</td>
        <td><button type="button" class="wwt-remove">×</button></td>
      `;
      tbody.appendChild(tr);
      recalc();
    });

    // Remove row
    tbody.addEventListener('click', e => {
      if (e.target.matches('.wwt-remove')) {
        e.target.closest('tr').remove();
        recalc();
      }
    });

    // Species “add custom”
    speciesSel.addEventListener('change', e => {
      const opt = e.target.selectedOptions[0];
      if (opt.hasAttribute('data-custom')) {
        const name = prompt('Species name:');
        const d    = parseFloat(prompt('Density in ' +
                        (unitSystem()==='imperial' ? 'lb/ft³' : 'kg/m³') + ':'));
        if (name && d>0) {
          const o = document.createElement('option');
          o.value = d;
          o.textContent = `${name} (${d} ${
            unitSystem()==='imperial' ? 'lb/ft³' : 'kg/m³'
          })`;
          speciesSel.insertBefore(o, opt);
          speciesSel.value = d;
        }
      }
      recalc();
    });

    // Recalc on any input
    tbody.addEventListener('input', recalc);
    speciesSel.addEventListener('change', recalc);

    // Start with one row
    addBtn.click();

    function recalc() {
      let sumVol = 0, sumWt = 0;
      const sys   = unitSystem();
      const density = parseFloat(speciesSel.value) || 0;

      tbody.querySelectorAll('tr').forEach(tr => {
        const tRaw = tr.querySelector('[data-field="t"]').value;
        const wRaw = tr.querySelector('[data-field="w"]').value;
        const lRaw = tr.querySelector('[data-field="l"]').value;

        let vol = 0, wt = 0;
        if (sys === 'imperial') {
          const t = parseFloat(tRaw) || 0;
          const w = parseFloat(wRaw) || 0;
          const l = toInches(lRaw);
          vol = bfCalc(t, w, l);
          wt  = lbFromBF(vol, density);
        } else {
          const tmm = toMm(tRaw);
          const wmm = toMm(wRaw);
          const lmm = toMm(lRaw);
          vol = m3Calc(tmm, wmm, lmm);
          wt  = kgFromM3(vol, density);
        }

        tr.querySelector('[data-out-vol]').textContent = 
          sys==='imperial' ? vol.toFixed(2) : vol.toFixed(3);

        sumVol += vol;
        sumWt += wt;
      });

      volTotal.textContent = sys==='imperial' ? sumVol.toFixed(2) : sumVol.toFixed(3);
      wtTotal.textContent  = sumWt.toFixed(1);
    }
  }
})();
