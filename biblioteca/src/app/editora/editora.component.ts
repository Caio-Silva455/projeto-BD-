import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ApiResponse {
  erro?: string;
  mensagem?: string;
}

@Component({
  selector: 'app-editora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editora.component.html',
  styleUrl: './editora.component.css',
})
export class EditoraComponent {

  private readonly API = 'http://localhost:4000';

  nomeEditora: string = '';
  loading: boolean = false;

  msg: string = '';
  msgTipo: 'ok' | 'erro' | '' = '';

  constructor(private http: HttpClient) {}

  get msgClasse(): string {
    if (!this.msgTipo) return 'mt-6 text-sm font-medium min-h-[20px]';
    return this.msgTipo === 'ok'
      ? 'mt-6 bg-emerald-100 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium'
      : 'mt-6 bg-red-100 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium';
  }

  async salvarEditora(): Promise<void> {
    const nome = this.nomeEditora.trim();

    if (!nome) {
      this.msg = '❌ Digite o nome da editora.';
      this.msgTipo = 'erro';
      return;
    }

    this.loading = true;
    this.msg = '';
    this.msgTipo = '';

    try {
      const data = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API}/editoras`, { nome })
      );

      this.msg = `✅ ${data.mensagem ?? 'Editora cadastrada com sucesso!'}`;
      this.msgTipo = 'ok';
      this.nomeEditora = '';
    } catch (err: unknown) {
      const httpErr = err as { error?: { erro?: string }; status?: number; statusText?: string };
      const detalhe =
        httpErr?.error?.erro ??
        (httpErr?.status ? `Erro ${httpErr.status}: ${httpErr.statusText}` : null) ??
        'Não foi possível conectar ao servidor. Verifique se o backend está rodando em localhost:4000.';

      this.msg = `❌ ${detalhe}`;
      this.msgTipo = 'erro';
    } finally {
      this.loading = false;
    }
  }
}