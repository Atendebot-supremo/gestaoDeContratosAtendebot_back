import { supabase } from '../../config/supabase';
import {
  Contrato,
  ContratoWithRelations,
  CreateContratoRequest,
  UpdateContratoRequest,
  ContratoFilters,
  ContratoStatus
} from './types';
import { APIResponse } from '../../types';

export class ContratosService {
  async listContratos(
    filters: ContratoFilters = {}
  ): Promise<APIResponse<ContratoWithRelations[]>> {
    try {
      let query = supabase
        .from('contratoslabfy')
        .select(
          `
          *,
          cliente:clienteslabfy(id, razao_social, cnpj),
          projeto:projetoslabfy(id, nome_projeto)
        `
        )
        .order('created_at', { ascending: false });

      // Aplica filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      if (filters.projeto_id) {
        query = query.eq('projeto_id', filters.projeto_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar contratos:', error);
        return {
          success: false,
          error: 'Erro ao buscar contratos',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      // Transforma dados para o formato esperado
      const contratos = (data || []).map((item: any) => ({
        ...item,
        cliente: item.cliente
          ? {
              id: item.cliente.id,
              razao_social: item.cliente.razao_social,
              cnpj: item.cliente.cnpj
            }
          : undefined,
        projeto: item.projeto
          ? {
              id: item.projeto.id,
              nome_projeto: item.projeto.nome_projeto
            }
          : undefined
      }));

      return {
        success: true,
        data: contratos
      };
    } catch (error) {
      console.error('Erro no serviço de contratos:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async getContratoById(
    id: string
  ): Promise<APIResponse<ContratoWithRelations>> {
    try {
      const { data, error } = await supabase
        .from('contratoslabfy')
        .select(
          `
          *,
          cliente:clienteslabfy(id, razao_social, cnpj),
          projeto:projetoslabfy(id, nome_projeto)
        `
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Contrato não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Transforma dados
      const contrato: ContratoWithRelations = {
        ...data,
        cliente: data.cliente
          ? {
              id: data.cliente.id,
              razao_social: data.cliente.razao_social,
              cnpj: data.cliente.cnpj
            }
          : undefined,
        projeto: data.projeto
          ? {
              id: data.projeto.id,
              nome_projeto: data.projeto.nome_projeto
            }
          : undefined
      };

      return {
        success: true,
        data: contrato
      };
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async createContrato(
    contratoData: CreateContratoRequest
  ): Promise<APIResponse<Contrato>> {
    try {
      // Valida se cliente existe
      const { data: cliente } = await supabase
        .from('clienteslabfy')
        .select('id')
        .eq('id', contratoData.cliente_id)
        .single();

      if (!cliente) {
        return {
          success: false,
          error: 'Cliente não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Valida se projeto existe
      const { data: projeto } = await supabase
        .from('projetoslabfy')
        .select('id')
        .eq('id', contratoData.projeto_id)
        .single();

      if (!projeto) {
        return {
          success: false,
          error: 'Projeto não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Cria contrato com status inicial
      const { data, error } = await supabase
        .from('contratoslabfy')
        .insert({
          ...contratoData,
          status: 'Aguardando Geração' as ContratoStatus
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contrato:', error);
        return {
          success: false,
          error: 'Erro ao criar contrato',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de criação de contrato:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async updateContrato(
    id: string,
    contratoData: UpdateContratoRequest
  ): Promise<APIResponse<Contrato>> {
    try {
      // Busca contrato existente
      const { data: existing } = await supabase
        .from('contratoslabfy')
        .select('id, status')
        .eq('id', id)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Contrato não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Validação: só permite edição se status for 'Aguardando Geração'
      if (
        existing.status !== 'Aguardando Geração' &&
        contratoData.status === undefined
      ) {
        // Se está tentando editar campos outros que não status
        const camposEditaveis = Object.keys(contratoData).filter(
          (key) => key !== 'status'
        );
        if (camposEditaveis.length > 0) {
          return {
            success: false,
            error:
              'Contrato só pode ser editado quando estiver com status "Aguardando Geração"',
            code: 'FORBIDDEN' as any
          };
        }
      }

      // Valida cliente se está sendo atualizado
      if (contratoData.cliente_id) {
        const { data: cliente } = await supabase
          .from('clienteslabfy')
          .select('id')
          .eq('id', contratoData.cliente_id)
          .single();

        if (!cliente) {
          return {
            success: false,
            error: 'Cliente não encontrado',
            code: 'NOT_FOUND' as any
          };
        }
      }

      // Valida projeto se está sendo atualizado
      if (contratoData.projeto_id) {
        const { data: projeto } = await supabase
          .from('projetoslabfy')
          .select('id')
          .eq('id', contratoData.projeto_id)
          .single();

        if (!projeto) {
          return {
            success: false,
            error: 'Projeto não encontrado',
            code: 'NOT_FOUND' as any
          };
        }
      }

      // Valida status se está sendo atualizado
      const statusValidos: ContratoStatus[] = [
        'Aguardando Geração',
        'Aguardando Revisão',
        'Enviado',
        'Ativo',
        'Cancelado'
      ];
      if (
        contratoData.status &&
        !statusValidos.includes(contratoData.status)
      ) {
        return {
          success: false,
          error: 'Status inválido',
          code: 'INVALID_INPUT' as any
        };
      }

      // Atualiza contrato
      const { data, error } = await supabase
        .from('contratoslabfy')
        .update(contratoData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar contrato:', error);
        return {
          success: false,
          error: 'Erro ao atualizar contrato',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de atualização de contrato:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async deleteContrato(id: string): Promise<APIResponse<void>> {
    try {
      const { error } = await supabase
        .from('contratoslabfy')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar contrato:', error);
        return {
          success: false,
          error: 'Erro ao deletar contrato',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro no serviço de exclusão de contrato:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }
}

