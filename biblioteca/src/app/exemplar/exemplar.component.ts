import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
}

interface Emprestimo {
  id: number;
  idAluno: number;
  nomeAluno?: string;
  idExemplar: number;
  dataEmprestimo: string;
  dataDevolucaoPrevista?: string;
  dataDevolucao?: string;
}

interface ApiResponse {
  erro?: string;
  mensagem?: string;
}

type StatusEmprestimo = 'devolvido' | 'atraso' | 'vencendo' | 'ativo';

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-emprestimo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exemplar.component.html',
  styleUrl: './exemplar.component.css',
})
export class EmprestimoComponent implements OnInit {

  private readonly API = 'http://localhost:4000';

  // ─── Dados ────────────────────────────────────────────────────────────────

  alunos: Aluno[] = [];
  todosEmprestimos: Emprestimo[] = [];
  emprestimosFiltrados: Emprestimo[] = [];

  // ─── Formulário ───────────────────────────────────────────────────────────

  idAlunoSelecionado: string = '';
  idExemplar: string = '';
  dataEmprestimo: string = '';
  dataDevolucao: string = '';
  termoBusca: string = '';

  // ─── Feedback ─────────────────────────────────────────────────────────────

  msg: string = '';
  msgTipo: 'ok' | 'erro' | '' = '';

  // ─── Cards ────────────────────────────────────────────────────────────────

  totalAtivos: number = 0;
  totalAtraso: number = 0;
  totalVencendo: number = 0;

  // ─── Loading ──────────────────────────────────────────────────────────────

  loadingTabela: boolean = false;
  loadingRegistrar: boolean = false;
  erroTabela: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.dataEmprestimo = hoje;

    const dev = new Date();
    dev.setDate(dev.getDate() + 15);
    this.dataDevolucao = dev.toISOString().split('T')[0];

    this.carregarAlunos();
    this.carregarEmprestimos();
  }

  // ─── Carregar alunos ─────────────────────────────────────────────────────

  async carregarAlunos(): Promise<void> {
    try {
      this.alunos = await firstValueFrom(
        this.http.get<Aluno[]>(`${this.API}/alunos`)
      );
    } catch {
      this.alunos = [];
    }
  }

  // ─── Registrar empréstimo ─────────────────────────────────────────────────

  async registrarEmprestimo(): Promise<void> {
    if (!this.idAlunoSelecionado || !this.idExemplar.trim() || !this.dataEmprestimo) {
      this.msg = 'Preencha aluno, exemplar e data.';
      this.msgTipo = 'erro';
      return;
    }

    this.loadingRegistrar = true;
    this.msg = '';
    this.msgTipo = '';

    try {
      await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API}/exemplar-emprestado`, {
          idAluno: parseInt(this.idAlunoSelecionado),
          idExemplar: parseInt(this.idExemplar),
          dataEmprestimo: this.dataEmprestimo,
          dataDevolucao: this.dataDevolucao || null,
        })
      );

      this.msg = 'Empréstimo registrado com sucesso!';
      this.msgTipo = 'ok';
      this.limparFormulario();
      await this.carregarEmprestimos();
    } catch (err: unknown) {
      const httpErr = err as { error?: { erro?: string } };
      this.msg = httpErr?.error?.erro ?? 'Erro ao conectar com o servidor.';
      this.msgTipo = 'erro';
    } finally {
      this.loadingRegistrar = false;
    }
  }

  // ─── Carregar empréstimos ─────────────────────────────────────────────────

  async carregarEmprestimos(): Promise<void> {
    this.loadingTabela = true;
    this.erroTabela = '';

    try {
      this.todosEmprestimos = await firstValueFrom(
        this.http.get<Emprestimo[]>(`${this.API}/exemplar-emprestado`)
      );
      this.atualizarCards(this.todosEmprestimos);
      this.filtrarTabela();
    } catch (err: unknown) {
      const e = err instanceof Error ? err.message : 'Erro desconhecido';
      this.erroTabela = `Erro ao carregar: ${e}`;
    } finally {
      this.loadingTabela = false;
    }
  }

  // ─── Cards de resumo ─────────────────────────────────────────────────────

  atualizarCards(dados: Emprestimo[]): void {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const em3 = new Date(hoje); em3.setDate(em3.getDate() + 3);

    const ativos = dados.filter(d => !d.dataDevolucao);
    this.totalAtivos = ativos.length;
    this.totalAtraso = ativos.filter(d =>
      d.dataDevolucaoPrevista && new Date(d.dataDevolucaoPrevista) < hoje
    ).length;
    this.totalVencendo = ativos.filter(d => {
      if (!d.dataDevolucaoPrevista) return false;
      const dt = new Date(d.dataDevolucaoPrevista);
      return dt >= hoje && dt <= em3;
    }).length;
  }

  // ─── Status badge ─────────────────────────────────────────────────────────

  getStatus(emp: Emprestimo): StatusEmprestimo {
    if (emp.dataDevolucao) return 'devolvido';
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const em3 = new Date(hoje); em3.setDate(em3.getDate() + 3);
    if (!emp.dataDevolucaoPrevista) return 'ativo';
    const dev = new Date(emp.dataDevolucaoPrevista);
    if (dev < hoje) return 'atraso';
    if (dev <= em3) return 'vencendo';
    return 'ativo';
  }

  getStatusLabel(emp: Emprestimo): string {
    const map: Record<StatusEmprestimo, string> = {
      devolvido: 'Devolvido',
      atraso: 'Em atraso',
      vencendo: 'Vence em breve',
      ativo: 'Ativo',
    };
    return map[this.getStatus(emp)];
  }

  getStatusClasse(emp: Emprestimo): string {
    const map: Record<StatusEmprestimo, string> = {
      devolvido: 'bg-slate-100 text-slate-500',
      atraso: 'bg-red-100 text-red-600',
      vencendo: 'bg-yellow-100 text-yellow-600',
      ativo: 'bg-emerald-100 text-emerald-600',
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${map[this.getStatus(emp)]}`;
  }

  // ─── Filtro de busca ─────────────────────────────────────────────────────

  filtrarTabela(): void {
    if (!this.termoBusca.trim()) {
      this.emprestimosFiltrados = [...this.todosEmprestimos];
      return;
    }
    const termo = this.termoBusca.toLowerCase();
    this.emprestimosFiltrados = this.todosEmprestimos.filter(d =>
      (d.nomeAluno ?? '').toLowerCase().includes(termo)
    );
  }

  // ─── Devolver exemplar ────────────────────────────────────────────────────

  async devolverExemplar(id: number): Promise<void> {
    if (!confirm('Confirmar devolução deste exemplar?')) return;

    try {
      await firstValueFrom(
        this.http.put<ApiResponse>(`${this.API}/exemplar-emprestado/${id}/devolver`, {
          dataDevolucao: new Date().toISOString().split('T')[0],
        })
      );
      await this.carregarEmprestimos();
    } catch (err: unknown) {
      const httpErr = err as { error?: { erro?: string } };
      alert(`Erro: ${httpErr?.error?.erro ?? 'Erro ao conectar com o servidor.'}`);
    }
  }

  // ─── Limpar formulário ────────────────────────────────────────────────────

  limparFormulario(): void {
    this.idAlunoSelecionado = '';
    this.idExemplar = '';
    this.msg = '';
    this.msgTipo = '';

    const hoje = new Date().toISOString().split('T')[0];
    this.dataEmprestimo = hoje;

    const dev = new Date();
    dev.setDate(dev.getDate() + 15);
    this.dataDevolucao = dev.toISOString().split('T')[0];
  }

  // ─── Helper data ──────────────────────────────────────────────────────────

  formatarData(data?: string): string {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // ─── Getter classes de msg ────────────────────────────────────────────────

  get msgClasse(): string {
    if (!this.msgTipo) return '';
    return this.msgTipo === 'ok'
      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs'
      : 'text-red-500 text-xs';
  }
}