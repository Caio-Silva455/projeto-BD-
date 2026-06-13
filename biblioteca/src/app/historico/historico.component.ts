import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── Interface ────────────────────────────────────────────────────────────────

interface HistoricoItem {
  id?: number;

  // nome do aluno (diferentes grafias vindas do backend)
  nome_aluno?: string;
  NOME_ALUNO?: string;
  nome?: string;

  // título do livro
  titulo_livro?: string;
  TITULO_LIVRO?: string;
  titulo?: string;

  // id do exemplar
  idExemplarEmprestado?: number;
  idExemplar?: number;
  id_exemplar?: number;

  // datas
  data_emprestimo?: string;
  DATA_EMPRESTIMO?: string;
  data_devolucao?: string;
  DATA_DEVOLUCAO?: string;
  data_pagamento_multa?: string;
  DATA_PAGAMENTO_MULTA?: string;

  // observações
  descricao?: string;
  DESCRICAO?: string;
}

type StatusMulta = 'sem-multa' | 'paga' | 'aberta';

interface HistoricoView {
  id: number | string;
  nomeAluno: string;
  tituloLivro: string;
  idExemplar: number | string;
  dataEmprestimo: string;
  dataDevolucao: string | null;
  statusMulta: StatusMulta;
  dataMultaPaga: string | null;
  descricao: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css',
})
export class HistoricoComponent implements OnInit {

  private readonly API = 'http://localhost:4000';

  termoBusca: string = '';
  loading: boolean = false;
  erro: string = '';
  registros: HistoricoView[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  // ─── Carregar histórico ──────────────────────────────────────────────────

  async carregarHistorico(): Promise<void> {
    this.loading = true;
    this.erro = '';
    this.registros = [];

    try {
      let url = `${this.API}/historico`;
      if (this.termoBusca.trim()) {
        url += `?busca=${encodeURIComponent(this.termoBusca.trim())}`;
      }

      const dados = await firstValueFrom(
        this.http.get<HistoricoItem[]>(url)
      );

      this.registros = (dados ?? []).map(item => this.mapItem(item));
    } catch {
      this.erro = 'Erro ao conectar ou renderizar dados do Back-end.';
    } finally {
      this.loading = false;
    }
  }

  // ─── Limpar filtro ───────────────────────────────────────────────────────

  limparFiltro(): void {
    this.termoBusca = '';
    this.carregarHistorico();
  }

  // ─── Busca ao pressionar Enter ───────────────────────────────────────────

  onKeyEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.carregarHistorico();
  }

  // ─── Mapear item da API → HistoricoView ──────────────────────────────────

  private mapItem(item: HistoricoItem): HistoricoView {
    const nomeAluno     = item.nome_aluno ?? item.NOME_ALUNO ?? item.nome ?? 'N/A';
    const tituloLivro   = item.titulo_livro ?? item.TITULO_LIVRO ?? item.titulo ?? 'N/A';
    const idExemplar    = item.idExemplarEmprestado ?? item.idExemplar ?? item.id_exemplar ?? '-';
    const dataEmpRaw    = item.data_emprestimo ?? item.DATA_EMPRESTIMO;
    const dataDevRaw    = item.data_devolucao ?? item.DATA_DEVOLUCAO;
    const dataMultaRaw  = item.data_pagamento_multa ?? item.DATA_PAGAMENTO_MULTA;
    const descricao     = item.descricao ?? item.DESCRICAO ?? '';

    let statusMulta: StatusMulta = 'sem-multa';
    let dataMultaPaga: string | null = null;

    if (dataMultaRaw) {
      statusMulta = 'paga';
      dataMultaPaga = this.formatarData(dataMultaRaw);
    } else if (descricao.toLowerCase().includes('atraso')) {
      statusMulta = 'aberta';
    }

    return {
      id: item.id ?? '-',
      nomeAluno,
      tituloLivro,
      idExemplar,
      dataEmprestimo: this.formatarData(dataEmpRaw) ?? 'N/A',
      dataDevolucao: dataDevRaw ? this.formatarData(dataDevRaw) : null,
      statusMulta,
      dataMultaPaga,
      descricao,
    };
  }

  // ─── Helper data ─────────────────────────────────────────────────────────

  private formatarData(data?: string): string {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  }
}