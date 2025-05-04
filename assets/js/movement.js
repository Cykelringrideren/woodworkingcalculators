/* Wood Movement Predictor – v0.4.1
   Requires: Chart.js UMD   (handle: chartjs)
             const woodtools_assets_url (inlined by PHP)
*/
(() => {
  /* ──────────────────────────────────────────────────────────── */
  /* 1. Helpers                                                  */
  /* ──────────────────────────────────────────────────────────── */
  const calculateEMC_FPL = (rh, tC) => {
    if (rh < 0 || rh > 100 || tC === null || tC === undefined) {
      console.warn(`Invalid input to calculateEMC_FPL: RH=${rh}, Temp=${tC}`);
      return 0; // Or handle error appropriately
    }

    // Ensure RH is capped at a value slightly below 100 to avoid division by zero issues in formula
    // EMC approaches infinity as RH approaches 100 theoretically. Practically, wood gets saturated.
    // 99.5% is a reasonable upper limit for the formula's practical use.
    const h = Math.min(rh, 99.5) / 100; // Relative humidity as a fraction (0-0.995)
    const T = tC;                        // Temperature in Celsius

    const W = 349 + 1.29 * T + 0.0135 * T * T;
    const K = 0.805 + 0.000736 * T - 0.00000273 * T * T;
    const K1 = 6.27 - 0.00938 * T - 0.000303 * T * T;
    const K2 = 1.91 + 0.0407 * T - 0.000293 * T * T;

    const Kh = K * h;
    const K1Kh = K1 * Kh;
    const K1K2KhKh = K1 * K2 * Kh * Kh; // Simplified: K1 * K2 * K^2 * h^2

    // Check for potential division by zero (when h is high, 1-Kh can approach 0)
    if (1 - Kh <= 0) {
      // At very high RH, EMC theoretically goes very high. Return a saturation value (e.g., 30)
      console.warn(`EMC calculation approaching theoretical limit at RH=${rh}%, T=${tC}°C. Capping at 30%.`);
      return 30.0;
    }

    const term1 = Kh / (1 - Kh);
    const term2_numerator = K1Kh + 2 * K1K2KhKh;
    const term2_denominator = 1 + K1Kh + K1K2KhKh;

    if (term2_denominator === 0) {
      // This case should be unlikely if 1-Kh > 0, but good to check.
      console.warn(`EMC calculation encountered zero denominator in term 2 at RH=${rh}%, T=${tC}°C. Capping at 30%.`);
      return 30.0;
    }

    const term2 = term2_numerator / term2_denominator;

    const M = (1800 / W) * (term1 + term2);

    // Return the calculated EMC, clamped between reasonable bounds (0 and ~30+)
    // Adding a small epsilon for floating point comparisons might be wise if needed, but Math.max/min handles it.
    return Math.max(0, Math.min(35, M)); // Allow slightly above 30 for saturation effects
  };

  /* ──────────────────────────────────────────────────────────── */
  /* 2. Load species data                                        */
  /* ──────────────────────────────────────────────────────────── */
  let SPECIES = [];
  fetch(woodtools_assets_url + 'data/wood_movement.json')
    .then(r => r.json())
    .then(j => { SPECIES = j; boot(); })
    .catch(e => console.error('Wood movement JSON load failed', e));

  /* ──────────────────────────────────────────────────────────── */
  /* 3. Boot widgets                                             */
  /* ──────────────────────────────────────────────────────────── */
  function boot() {
    document.querySelectorAll('[data-wwt-component="movement"]')
      .forEach(init);
  }

  /* ──────────────────────────────────────────────────────────── */
  /* 4. Widget initialiser                                       */
  /* ──────────────────────────────────────────────────────────── */
  function init(root) {

    /* ---------- static refs ---------- */
    const compareBtn = root.querySelector('[data-compare]');
    const emcBtn = root.querySelector('[data-emc]');
    const chartCan = root.querySelector('[data-chart]');

    /* populate first species <select> */
    const firstSel = root.querySelector('[data-species][data-set="1"]');
    SPECIES.forEach(s => {
      firstSel.insertAdjacentHTML('beforeend',
        `<option value="${s.species}">${s.species}</option>`);
    });

    /* ---------- dataset objects ---------- */
    const sets = [makeSet(1)];
    let compareShown = false;

    /* ---------- buttons ---------- */
    compareBtn?.addEventListener('click', () => {
      if (!compareShown) {
        sets.push(cloneSet(2));
        root.querySelector('[data-line="2"]').style.display = '';
        compareShown = true;
        compareBtn.textContent = 'Remove comparison';
      } else {
        root.querySelectorAll('[data-set="2"]').forEach(n => n.remove());
        root.querySelector('[data-line="2"]').style.display = 'none';
        sets.length = 1;
        compareShown = false;
        compareBtn.textContent = 'Add comparison';
        calcAll();
      }
    });

    emcBtn?.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchCurrentClimate(pos.coords.latitude, pos.coords.longitude)
            .then(({ rh, temp }) => {
              // Use the new function here
              const emc = calculateEMC_FPL(rh, temp).toFixed(1);
              console.log(`Calculated EMC: ${emc}% (from RH=${rh}, Temp=${temp})`); // Add log
              sets.forEach(s => { s.mc2.value = emc; });
              calcAll();
            })
            .catch(error => {
              // Error handling for fetchCurrentClimate is now inside that function mostly
              // But you might want a general message here if it fails.
              console.error("Failed to process climate data for EMC button.", error);
            });
        },
        e => {
          alert('Location error: ' + e.message);
          console.error('Geolocation Error:', e);
        },
        { maximumAge: 3.6e6, timeout: 10000 }
      );
    });

    /* ---------- chart ---------- */
    let chart;
    const ensureChart = () => {
      if (chart) return;
      chart = new Chart(chartCan, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              callbacks: {
                label(ctx) {
                  const val = ctx.raw;
                  const unitSel = root.querySelector('[data-unit]');
                  const txt = unitSel && unitSel.value === 'mm'
                    ? (val * 25.4).toFixed(2) + ' mm'
                    : val.toFixed(3) + ' in';
                  return ctx.dataset.label + ': ' + txt;
                }
              }
            }
          },
          scales: {
            x: { display: true },
            y: { display: false }
          },
          layout: { padding: { top: 4 } }
        }
      });
    };

    /* ---------- listeners ---------- */
    root.addEventListener('input', calcAll);
    root.addEventListener('change', calcAll);

    calcAll();                                   // initial render

    /* ── helpers ─────────────────────────────────────────────── */
    function makeSet(idx) {
      const wrap = root.querySelector(`.wwt-set[data-set="${idx}"]`);
      return {
        idx,
        wrap,
        sel: wrap.querySelector('[data-species]'),
        width: wrap.querySelector('[data-width]'),
        unit: wrap.querySelector('[data-unit]'),
        mc1: wrap.querySelector('[data-mc1]'),
        mc2: wrap.querySelector('[data-mc2]'),
        outAbs: root.querySelector(`[data-line="${idx}"] [data-out-abs]`),
        outPct: root.querySelector(`[data-line="${idx}"] [data-out-pct]`)
      };
    }

    function cloneSet(idx) {
      const first = root.querySelector('.wwt-set[data-set="1"]');
      const clone = first.cloneNode(true);
      clone.dataset.set = String(idx);
      clone.querySelectorAll('[data-set="1"]').forEach(el => {
        el.dataset.set = String(idx);
        if (el.matches('input,select')) el.value = '';
      });
      /* make radio names unique */
      clone.querySelectorAll('[data-orient]').forEach(r => {
        r.name = `orient_${crypto.randomUUID()}`;
        if (r.value === 'flat') r.checked = true;
      });
      first.after(clone);
      return makeSet(idx);
    }

    /* ---------- calculations ---------------------------------- */
    function calcAll() {
      sets.forEach(calcOne);
      buildChart();               // draw chart for one or two sets
    }

    function calcOne(set) {
      const sp = SPECIES.find(s => s.species === set.sel.value);
      if (!sp) return;

      const C = set.wrap.querySelector('[data-orient]:checked').value === 'flat'
        ? sp.tangential : sp.radial;

      let W = parseFloat(set.width.value) || 0;
      if (set.unit.value === 'mm') W /= 25.4;

      const mc1 = parseFloat(set.mc1.value) || 0;
      const mc2 = parseFloat(set.mc2.value) || 0;
      const dMC = mc2 - mc1;

      const pct = C * (dMC / 30);
      const abs = W * (pct / 100);

      const disp = set.unit.value === 'mm'
        ? (abs * 25.4).toFixed(2) + ' mm'
        : abs.toFixed(3) + ' in';

      set.outAbs.textContent = (abs >= 0 ? '+' : '') + disp;
      set.outPct.textContent = '(' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + ' %)';
    }

    /* ---------- chart builder --------------------------------- */
    function buildChart() {
      ensureChart();

      /* gather active sets */
      const active = sets.map((set, idx) => {
        const sp = SPECIES.find(s => s.species === set.sel.value);
        if (!sp) return null;

        const C = set.wrap.querySelector('[data-orient]:checked').value === 'flat'
          ? sp.tangential : sp.radial;
        let W = parseFloat(set.width.value) || 0;
        if (set.unit.value === 'mm') W /= 25.4;

        return {
          idx,
          C,
          W,
          startMC: parseFloat(set.mc1.value) || 8,
          colour: idx ? '#4dabf7' : '#7eb6ff',
          unitSel: set.unit.value
        };
      }).filter(Boolean);

      if (!active.length) return;

      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchMonthlyClimate(pos.coords.latitude, pos.coords.longitude)
            .then(({ rh, temp }) => {
              if (!Array.isArray(rh) || rh.length !== 12 || rh.length !== temp.length) {
                console.warn('Climate API missing monthly data, chart skipped');
                return;
              }

              // Inside buildChart, within the active.map section:
              const datasets = active.map(ds => {
                const data = rh.map((RH, i) => { 
                  // Use the new function here for monthly chart points
                  const emc = calculateEMC_FPL(RH, temp[i]);
                  const dMC = emc - ds.startMC;
                  const pct = ds.C * (dMC / 30); // Assuming 30% fiber saturation point for this calc is okay
                  const abs = ds.W * (pct / 100);
                  return +abs.toFixed(3);
                });
                return {
                  label: ds.idx ? 'Set 2' : 'Set 1',
                  data,
                  backgroundColor: ds.colour
                };
              });

              chart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              chart.data.datasets = datasets;
              chart.options.plugins.legend.display = datasets.length > 1;
              chart.update();
            });
        },
        () => {/* ignore if geolocation denied */ }
      );
    }

    /* climate helpers */
    function fetchCurrentClimate(lat, lon) {
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,temperature_2m&timezone=auto`)
        .then(r => r.json())
        .then(j => ({
          rh: j.current.relative_humidity_2m,
          temp: j.current.temperature_2m
        }));
    }

    /* daily to monthly averages */
    function fetchMonthlyClimate(lat, lon) {
      const yr = new Date().getFullYear() - 1;     // last full year
      return fetch(`https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=${yr}-01-01&end_date=${yr}-12-31&models=MPI_ESM1_2_XR&daily=temperature_2m_mean,relative_humidity_2m_mean&temperature_unit=celsius&timezone=auto`)
        .then(r => r.json())
        .then(j => {
          const time = j.daily?.time || [];
          const rhDay = j.daily?.relative_humidity_2m_mean || [];
          const tDay = j.daily?.temperature_2m_mean || [];

          const rh = Array(12).fill(0).map(() => []);
          const tt = Array(12).fill(0).map(() => []);
          time.forEach((iso, i) => {
            const m = new Date(iso).getUTCMonth();
            rh[m].push(rhDay[i]);
            tt[m].push(tDay[i]);
          });
          const avg = arr => arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
          return {
            rh: rh.map(avg),
            temp: tt.map(avg)
          };
        });
    }
  }
})();  