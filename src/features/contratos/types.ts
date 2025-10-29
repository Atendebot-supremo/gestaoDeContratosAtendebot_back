export type ContratoStatus =
  | 'Aguardando Geração'
  | 'Aguardando Revisão'
  | 'Enviado'
  | 'Ativo'
  | 'Cancelado';

export interface Contrato {
  id: string;
  cliente_id: string;
  projeto_id: string;
  url_contrato_gerado?: string;
  clicksign_document_key?: string;
  asaas_subscription_id?: string;
  asaas_setup_payment_id?: string;
  valor_mensalidade: string;
  valor_setup: string;
  plano_nome: string;
  prazo_implementacao_dias?: number;
  provedor_openai?: string;
  forma_pagamento?: string;
  observacoes_ia?: string;
  assinante_venda_nome?: string;
  assinante_venda_email?: string;
  status: ContratoStatus;
  created_at: string;
}

export interface ContratoWithRelations extends Contrato {
  cliente?: {
    id: string;
    razao_social: string;
    cnpj: string;
  };
  projeto?: {
    id: string;
    nome_projeto: string;
  };
}

export interface CreateContratoRequest {
  cliente_id: string;
  projeto_id: string;
  valor_mensalidade: string;
  valor_setup: string;
  plano_nome: string;
  prazo_implementacao_dias?: number;
  provedor_openai?: string;
  forma_pagamento?: string;
  observacoes_ia?: string;
  assinante_venda_nome?: string;
  assinante_venda_email?: string;
}

export interface UpdateContratoRequest extends Partial<CreateContratoRequest> {
  status?: ContratoStatus;
}

export interface ContratoFilters {
  status?: ContratoStatus;
  cliente_id?: string;
  projeto_id?: string;
}

