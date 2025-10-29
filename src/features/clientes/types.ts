export interface Cliente {
  id: string;
  asaas_customer_id?: string;
  razao_social: string;
  cnpj: string;
  endereco_completo?: string;
  cidade_estado?: string;
  assinante_nome?: string;
  assinante_email?: string;
  financeiro_nome?: string;
  financeiro_email?: string;
  financeiro_telefone?: string;
  created_at: string;
}

export interface CreateClienteRequest {
  razao_social: string;
  cnpj: string;
  endereco_completo?: string;
  cidade_estado?: string;
  assinante_nome?: string;
  assinante_email?: string;
  financeiro_nome?: string;
  financeiro_email?: string;
  financeiro_telefone?: string;
}

export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {}

export interface ClienteWithContratos extends Cliente {
  contratos?: Array<{
    id: string;
    projeto_id: string;
    status: string;
    valor_mensalidade: number;
    created_at: string;
  }>;
}

