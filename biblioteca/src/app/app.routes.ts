import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'alunos',
    loadComponent: () =>
      import('./aluno/aluno.component').then(m => m.AlunoComponent),
  },
  {
    path: 'livros',
    loadComponent: () =>
      import('./livro/livro.component').then(m => m.LivroComponent),
  },
  {
    path: 'exemplares',
    loadComponent: () =>
      import('./exemplar/exemplar.component').then(m => m.EmprestimoComponent),
  },
  {
    path: 'editoras',
    loadComponent: () =>
      import('./editora/editora.component').then(m => m.EditoraComponent),
  },
  {
    path: 'area-conhecimento',
    loadComponent: () =>
      import('./area-conhecimento/area-conhecimento.component').then(m => m.AreaConhecimentoComponent),
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/historico.component').then(m => m.HistoricoComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];