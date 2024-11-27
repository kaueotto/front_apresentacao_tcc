let pedidosData = [];  // Variável global para armazenar os pedidos carregados

async function carregarDadosApi() {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/dados');
    if (!response.ok) throw new Error('Erro ao carregar dados da API');

    const dados = await response.json(); // Converte a resposta em JSON
    console.log(dados); // Verifica os dados no console

    pedidosData = dados; // Armazena os dados carregados em pedidosData

    // Renderiza os dados na tabela
    renderizarPedidos(pedidosData);
  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

function renderizarPedidos(pedidos) {
  const tbody = document.getElementById('pedidosTableBody');
  tbody.innerHTML = ''; // Limpa a tabela antes de renderizar

  pedidos.forEach((pedido) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pedido['pedid'] || 0}</td>
      <td>${pedido['IdCliente'] || 0}</td>
      <td>R$ ${(pedido['CliLimCredTot'] || 0).toLocaleString()}</td>
      <td>${pedido['clisimples'] ? 'Sim' : 'Não'}</td>
      <td>${pedido['cliMicroEmpreendedor'] ? 'Sim' : 'Não'}</td>
      <td>${pedido['CliConsFinal'] ? 'Sim' : 'Não'}</td>
      <td>${pedido['HistPagPONTUAL'] || 0}%</td>
      <td>${pedido['HistPag8_15'] || 0}%</td>
      <td>${pedido['HistPag16_30'] || 0}%</td>
      <td>${pedido['HistPag31_60'] || 0}%</td>
      <td>${pedido['HistPag_60'] || 0}%</td>
      <td>${pedido['HistPagAVISTA'] || 0}%</td>
      <td>${pedido['QtConsultado'] || 0}</td>
      <td>${pedido['PefinNumOcorrencia'] || 0}</td>
      <td>R$ ${(pedido['PefinValorTotal'] || 0).toLocaleString()}</td>
      <td>${pedido['RefinNumOcorrencia'] || 0}</td>
      <td>R$ ${(pedido['RefinValorTotal'] || 0).toLocaleString()}</td>
      <td>${pedido['DividasVencNumOcorrencia'] || 0}</td>
      <td>R$ ${(pedido['DividasVencValorTotal'] || 0).toLocaleString()}</td>
      <td>${pedido['FalenConcNumOcorrencia'] || 0}</td>
      <td>${pedido['CheqSFundoNumOcorrencia'] || 0}</td>
      <td>${pedido['RechequeNumOcorrencia'] || 0}</td>
      <td>${pedido['PartFalenNumOcorrencia'] || 0}</td>
      <td>${pedido.statusResultado || "Pendente"}</td>
      <td>${pedido.detalhes || "Sem detalhes"}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function processarPedidos() {
  if (pedidosData.length === 0) {
    console.error("Nenhum pedido disponível para processar");
    return;  // Não processar se não houver dados
  }

  // Atualiza o status e determina se os pedidos são aprovados
  pedidosData.forEach((pedido) => {
    const score =
      pedido.histPagPONTUAL -
      pedido.pefinNumOcorrencia * 10 -
      pedido.refinNumOcorrencia * 5;

    pedido.aprovado = score >= 70;
    pedido.status = pedido.aprovado ? "Aprovado" : "Reprovado";
  });

  // Renderiza a tabela atualizada
  renderizarPedidos(pedidosData);

  // Itera sobre os pedidos e envia linha por linha
  for (const pedido of pedidosData) {
    const body = {
      pedid: pedido.pedid ?? 0,
      CliLimCredTot: pedido.cliLimCredTot ?? 0,
      clisimples: pedido.clisimples ? 1 : 0,
      cliMicroEmpreendedor: pedido.cliMicroEmpreendedor ? 1 : 0,
      CliConsFinal: pedido.cliConsFinal ? 1 : 0,
      HistPagPONTUAL: pedido.histPagPONTUAL ?? 0,
      HistPag8_15: pedido.histPag8_15 ?? 0,
      HistPag16_30: pedido.histPag16_30 ?? 0,
      HistPag31_60: pedido.histPag31_60 ?? 0,
      HistPag_60: pedido.histPag_60 ?? 0,
      HistPagAVISTA: pedido.histPagAVISTA ?? 0,
      QtConsultado: pedido.qtConsultado ?? 0,
      PefinNumOcorrencia: pedido.pefinNumOcorrencia ?? 0,
      PefinValorTotal: pedido.pefinValorTotal ?? 0,
      RefinNumOcorrencia: pedido.refinNumOcorrencia ?? 0,
      RefinValorTotal: pedido.refinValorTotal ?? 0,
      DividasVencNumOcorrencia: pedido.dividasVencNumOcorrencia ?? 0,
      DividasVencValorTotal: pedido.dividasVencValorTotal ?? 0,
      FalenConcNumOcorrencia: pedido.falenConcNumOcorrencia ?? 0,
      CheqSFundoNumOcorrencia: pedido.cheqSFundoNumOcorrencia ?? 0,
      RechequeNumOcorrencia: pedido.rechequeNumOcorrencia ?? 0,
      PartFalenNumOcorrencia: pedido.partFalenNumOcorrencia ?? 0,
    };

    try {
      // Faz a solicitação POST ao endpoint
      console.log(body)
      const response = await fetch("http://localhost:8081/fila/pedidos", {
        method: "POST",
        headers: {
          "Authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIgICAgIjoiYW1hcmlsZG8gem9sZXQifQ.s7uasVHc1C8WjxBMg83eNRUzn7yRp0J15U0cp9g4eC8",
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`Pedido ${pedido.idCliente} enviado com sucesso.`);
      } else {
        throw new Error(`Erro ao enviar pedido ${pedido.idCliente}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erro ao enviar pedido ${pedido.idCliente}:`, error);
    }
  }
}

async function buscarResultados() {
  for (const pedido of pedidosData) {
    const body = { pedid: pedido.pedid };

    try {
      // Faz a solicitação POST ao endpoint
      const response = await fetch("http://localhost:8081/fila/pedidos/resultado", {
        method: "POST",
        headers: {
          "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIgICAgIjoiYW1hcmlsZG8gem9sZXQifQ.s7uasVHc1C8WjxBMg83eNRUzn7yRp0J15U0cp9g4eC8",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar resultado para o pedido ${pedido.pedid}: ${response.status}`);
      }

      const resultado = await response.json();
      pedido.statusResultado = resultado.resultado === "1" ? "Aprovado" : "Reprovado";
      pedido.detalhes = parseMotivo(resultado.motivo);
    } catch (error) {
      console.error(`Erro ao buscar resultado para o pedido ${pedido.pedid}:`, error);
      pedido.statusResultado = "Erro";
      pedido.detalhes = "Erro ao buscar resultado";
    }
  }

  // Atualiza a tabela com os resultados
  renderizarPedidos(pedidosData);
}

function parseMotivo(motivoStr) {
  try {
    const motivoObj = JSON.parse(motivoStr);
    return Object.entries(motivoObj)
      .map(([campo, valor]) => `${campo}: ${valor}`)
      .join("; ");
  } catch (error) {
    console.error("Erro ao parsear motivo:", error);
    return "Motivo inválido";
  }
}




// Carrega os dados da API ao carregar a página
document.addEventListener("DOMContentLoaded", carregarDadosApi);
