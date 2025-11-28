function montarQuadroHorarios(csvText) {
  const linhas = csvText.split(/\r?\n/).filter(l => l.trim() !== '');

  // Cada linha do CSV: Dia;Turma;Disciplina;Inicio;Fim
  for (const linha of linhas) {
    const partes = linha.split(';');
    if (partes.length < 5) continue;

    const dia        = partes[0].trim();
    const turma      = partes[1].trim();
    const disciplina = partes[2].trim();
    const inicio     = partes[3].trim();
    const fim        = partes[4].trim();

    // pula linhas totalmente vazias (Domingo;;;;, Segunda-feira;;;;, etc.)
    if (!dia || (!turma && !disciplina && !inicio && !fim)) continue;

    // intervalo exatamente como no data-intervalo do HTML
    const intervalo = `${inicio}-${fim}`; // ex: "7:30-9:30"

    // acha a linha (tr) do intervalo
    const tr = document.querySelector(
      `#quadro-horarios tbody tr[data-intervalo="${intervalo}"]`
    );
    if (!tr) continue;

    // acha a célula (td) pelo dia
    const td = tr.querySelector(`td[data-dia="${dia}"]`);
    if (!td) continue;

    // preenche a célula no estilo do quadro
    td.innerHTML = `
      <div>${disciplina}</div>
      <div><strong>${turma}</strong></div>
    `;
  }
}

fetch('../assets/horario/horarios.csv')
    .then(r => r.text())
    .then(text => montarQuadroHorarios(text))
    .catch(err => console.error('Erro ao carregar CSV', err));