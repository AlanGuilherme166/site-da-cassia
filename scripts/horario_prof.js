function montarQuadroHorarios(csvText) {
  const linhas = csvText.split(/\r?\n/).filter(l => l.trim() !== '');

  document.querySelectorAll('#quadro-horarios tbody td').forEach(td => td.innerHTML = '');

  for (const linha of linhas) {
    const partes = linha.split(';');
    if (partes.length < 5) continue;

    const dia        = partes[0].trim();
    const turma      = partes[1].trim();
    const disciplina = partes[2].trim();
    const inicio     = partes[3].trim();
    const fim        = partes[4].trim();

    if (!dia || (!turma && !disciplina && !inicio && !fim)) continue;

    const intervalo = `${inicio}-${fim}`;

    const tr = document.querySelector(
      `#quadro-horarios tbody tr[data-intervalo="${intervalo}"]`
    );
    if (!tr) continue;

    const td = tr.querySelector(`td[data-dia="${dia}"]`);
    if (!td) continue;

    td.innerHTML = `
      <div class="disciplina">${disciplina}</div>
      <div class="turma"><strong>${turma}</strong></div>
    `;
  }

  enableCellEditing();
}

function loadState() {
  const saved = localStorage.getItem('horario_edicao');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.warn('Estado salvo inválido', e);
    return null;
  }
}

function saveState(state) {
  localStorage.setItem('horario_edicao', JSON.stringify(state));
}

function buildStateFromTable() {
  const state = [];
  document.querySelectorAll('#quadro-horarios tbody tr').forEach(tr => {
    const intervalo = tr.getAttribute('data-intervalo') || '';
    tr.querySelectorAll('td').forEach(td => {
      const dia = td.getAttribute('data-dia') || '';
      const texto = td.innerText.trim();
      if (!texto) return;
      const linhas = texto.split(/\n+/).map(s => s.trim()).filter(Boolean);
      let disciplina = '';
      let turma = '';
      if (linhas.length === 1) {
        disciplina = linhas[0];
      } else if (linhas.length >= 2) {
        disciplina = linhas[0];
        turma = linhas.slice(1).join(' | ');
      }
      const parts = intervalo.split('-');
      const inicio = (parts[0]||'').trim();
      const fim = (parts[1]||'').trim();
      state.push({dia, turma, disciplina, inicio, fim});
    });
  });
  return state;
}

function enableCellEditing() {
  const tds = document.querySelectorAll('#quadro-horarios tbody td');
  tds.forEach(td => {
    td.addEventListener('dblclick', () => {
      td.setAttribute('contenteditable', 'true');
      td.focus();
    });
    td.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        td.blur();
      }
    });
    td.addEventListener('blur', () => {
      td.removeAttribute('contenteditable');
      const state = buildStateFromTable();
      saveState(state);
    });
  });
}

function exportCSVFromState(state) {
  const lines = [];
  for (const e of state) {
    lines.push([e.dia || '', e.turma || '', e.disciplina || '', e.inicio || '', e.fim || ''].join(';'));
  }
  return lines.join('\n');
}

function exportCSVFile() {
  const state = buildStateFromTable();
  const csv = exportCSVFromState(state);
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'horarios_exportados.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function restoreOriginalCSV(csvText) {
  localStorage.removeItem('horario_edicao');
  montarQuadroHorarios(csvText);
}

fetch('assets/horario/horarios.csv')
    .then(r => r.text())
    .then(text => {
      const saved = loadState();
      if (saved && saved.length) {
        document.querySelectorAll('#quadro-horarios tbody td').forEach(td => td.innerHTML = '');
        for (const entry of saved) {
          const intervalo = `${entry.inicio}-${entry.fim}`;
          const tr = document.querySelector(`#quadro-horarios tbody tr[data-intervalo="${intervalo}"]`);
          if (!tr) continue;
          const td = tr.querySelector(`td[data-dia="${entry.dia}"]`);
          if (!td) continue;
          td.innerHTML = `<div class="disciplina">${entry.disciplina || ''}</div><div class="turma"><strong>${entry.turma || ''}</strong></div>`;
        }
        enableCellEditing();
      } else {
        montarQuadroHorarios(text);
      }

      // adiciona handlers para botões (se existirem)
      const btnExport = document.getElementById('btn-export-csv');
      if (btnExport) btnExport.addEventListener('click', exportCSVFile);
      const btnRestore = document.getElementById('btn-restore-original');
      if (btnRestore) btnRestore.addEventListener('click', () => restoreOriginalCSV(text));
      const btnClear = document.getElementById('btn-clear-local');
      if (btnClear) btnClear.addEventListener('click', () => { localStorage.removeItem('horario_edicao'); location.reload(); });
    })
    .catch(err => console.error('Erro ao carregar CSV', err));