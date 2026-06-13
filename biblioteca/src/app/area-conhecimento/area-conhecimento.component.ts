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
  selector: 'app-area-conhecimento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-conhecimento.component.html',
  styleUrl: './area-conhecimento.component.css',
})
export class AreaConhecimentoComponent {

  private readonly API = 'http://localhost:4000';

  nomeArea: string = '';
  loading: boolean = false;

  msg: string = '';
  msgTipo: 'ok' | 'erro' | '' = '';

  constructor(private http: HttpClient) {}

  get msgClasse(): string {
    if (!this.msgTipo) return '';
    return this.msgTipo === 'ok'
      ? 'mt-6 bg-emerald-100 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium'
      : 'mt-6 bg-red-100 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium';
  }

  async salvarArea(): Promise<void> {
    const nome = this.nomeArea.trim();

    if (!nome) {
      this.msg = '❌ Digite uma aréa de conhecimento.';
      this.msgTipo = 'erro';
      return;
    }

    this.loading = true;
    this.msg = '';
    this.msgTipo = '';

    try {
      const data = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API}/areas-conhecimento`, { nome })
      );

      this.msg = `✅ ${data.mensagem}`;
      this.msgTipo = 'ok';
      this.nomeArea = '';
    } catch (err: unknown) {
      const httpErr = err as { error?: { erro?: string } };
      const detalhe = httpErr?.error?.erro ?? 'Erro ao conectar com o servidor.';
      this.msg = `❌ ${detalhe}`;
      this.msgTipo = 'erro';
    } finally {
      this.loading = false;
    }
  }
}