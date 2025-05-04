(() => {
    // Convert "8 ft" or "96 in" to inches
    const toInches = raw => {
      if (!raw) return 0;
      const ft = raw.match(/^([\d.]+)\s*ft$/i);
      if (ft) return parseFloat(ft[1]) * 12;
      const inch = raw.match(/^([\d.]+)\s*in$/i);
      if (inch) return parseFloat(inch[1]);
      return parseFloat(raw) || 0;
    };
  
    // Board‐foot formula: t(in)*w(in)*l(in)/12
    const bfCalc = (t, w, l) => t * w * l / 12;
  
    document.querySelectorAll('[data-wwt-component="board-foot"]').forEach(init);
  
    function init(root) {
      const tbody     = root.querySelector('[data-rows]');
      const addBtn    = root.querySelector('[data-add-row]');
      const totalEl   = root.querySelector('[data-total]');
      const costInput = root.querySelector('[data-cost]');
      const costOut   = root.querySelector('[data-total-cost]');
  
      // Create one row with inputs + remove button
      function makeRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input data-field="t" placeholder="T (in)" /></td>
          <td><input data-field="w" placeholder="W (in)" /></td>
          <td><input data-field="l" placeholder="L (ft or in)" /></td>
          <td data-out>0.00</td>
          <td><button type="button" class="wwt-remove">×</button></td>
        `;
        return tr;
      }
  
      // Add initial row
      tbody.appendChild(makeRow());
  
      // Recalculate all rows and totals
      function recalc() {
        let sum = 0;
        tbody.querySelectorAll('tr').forEach(tr => {
          const t  = parseFloat(tr.querySelector('[data-field="t"]').value) || 0;
          const w  = parseFloat(tr.querySelector('[data-field="w"]').value) || 0;
          const l  = toInches(tr.querySelector('[data-field="l"]').value);
          const bf = bfCalc(t, w, l);
          tr.querySelector('[data-out]').textContent = bf.toFixed(2);
          sum += bf;
        });
  
        totalEl.textContent = sum.toFixed(2);
  
        // Handle cost if provided
        const rate = parseFloat(costInput.value) || 0;
        if (rate > 0) {
          const totalCost = (rate * sum).toFixed(2);
          costOut.style.display = '';
          costOut.textContent = `Cost @ \$${rate.toFixed(2)} / bd ft = \$${totalCost}`;
        } else {
          costOut.style.display = 'none';
        }
      }
  
      // Events
      addBtn.addEventListener('click', () => {
        tbody.appendChild(makeRow());
        recalc();
      });
  
      tbody.addEventListener('input', recalc);
  
      tbody.addEventListener('click', e => {
        if (e.target.matches('.wwt-remove')) {
          e.target.closest('tr').remove();
          recalc();
        }
      });
  
      costInput.addEventListener('input', recalc);
  
      // First calculation
      recalc();
    }
  })();
  