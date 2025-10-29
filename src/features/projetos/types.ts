export interface Projeto {
  id: string;
  nome_projeto: string;
  descricao?: string;
  template_html?: string;
  template_pdf_path?: string;
  created_at: string;
}

export interface CreateProjetoRequest {
  nome_projeto: string;
  descricao?: string;
}

export interface UpdateProjetoRequest extends Partial<CreateProjetoRequest> {}

