import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly API = 'http://localhost:4000';

  termoBusca = '';
  resultados: any[] = [];
  carregando = false;
  msgBusca = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // nada aqui
  }

  async executarBuscaGeral(): Promise<void> {
    const termo = this.termoBusca.trim();
    if (!termo) {
      this.msgBusca = 'Informe um termo para buscar.';
      return;
    }
    this.carregando = true;
    this.msgBusca = '';
    this.resultados = [];
    try {
      const dados = await firstValueFrom(
        this.http.get<any[]>(`${this.API}/busca?q=${encodeURIComponent(termo)}`),
      );
      this.resultados = dados ?? [];
      if (this.resultados.length === 0) {
        this.msgBusca = 'Nenhum resultado encontrado.';
      }
    } catch (err: any) {
      this.msgBusca = `Erro: ${err.message}`;
    } finally {
      this.carregando = false;
    }
  }
}
