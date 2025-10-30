import { supabase } from '../../config/supabase';
import {
  Cliente,
  CreateClienteRequest,
  UpdateClienteRequest,
  ClienteWithContratos
} from './types';
import { APIResponse } from '../../types';
import { formatCNPJ } from '../../utils/cnpjValidator';

export class ClientesService {
  async listClientes(filters?: {
    cnpj?: string;
    razao_social?: string;
  }): Promise<APIResponse<Cliente[]>> {
    try {
      let query = supabase.from('clienteslabfy').select('*').order('created_at', { ascending: false });

      if (filters?.cnpj) {
        const cleanCNPJ = filters.cnpj.replace(/[^\d]/g, '');
        query = query.ilike('cnpj', `%${cleanCNPJ}%`);
      }

      if (filters?.razao_social) {
        query = query.ilike('razao_social', `%${filters.razao_social}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar clientes:', error);
        return {
          success: false,
          error: 'Erro ao buscar clientes',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro no serviço de clientes:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async getClienteById(id: string): Promise<APIResponse<ClienteWithContratos>> {
    try {
      const { data: cliente, error } = await supabase
        .from('clienteslabfy')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !cliente) {
        return {
          success: false,
          error: 'Cliente não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Busca contratos do cliente
      const { data: contratos } = await supabase
        .from('contratoslabfy')
        .select('id, projeto_id, status, valor_mensalidade, created_at')
        .eq('cliente_id', id)
        .order('created_at', { ascending: false });

      return {
        success: true,
        data: {
          ...cliente,
          contratos: contratos || []
        }
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async createCliente(clienteData: CreateClienteRequest): Promise<APIResponse<Cliente>> {
    try {
      // Verifica se CNPJ já existe
      const cleanCNPJ = clienteData.cnpj.replace(/[^\d]/g, '');
      const { data: existing } = await supabase
        .from('clienteslabfy')
        .select('id')
        .eq('cnpj', cleanCNPJ)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'CNPJ já cadastrado',
          code: 'CONFLICT' as any
        };
      }

      const { data, error } = await supabase
        .from('clienteslabfy')
        .insert({
          ...clienteData,
          cnpj: cleanCNPJ // Salva sem formatação
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        return {
          success: false,
          error: 'Erro ao criar cliente',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de criação de cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async updateCliente(
    id: string,
    clienteData: UpdateClienteRequest
  ): Promise<APIResponse<Cliente>> {
    try {
      // Verifica se cliente existe
      const { data: existing } = await supabase
        .from('clienteslabfy')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Cliente não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Se CNPJ está sendo atualizado, verifica duplicatas
      if (clienteData.cnpj) {
        const cleanCNPJ = clienteData.cnpj.replace(/[^\d]/g, '');
        const { data: duplicate } = await supabase
          .from('clienteslabfy')
          .select('id')
          .eq('cnpj', cleanCNPJ)
          .neq('id', id)
          .single();

        if (duplicate) {
          return {
            success: false,
            error: 'CNPJ já cadastrado para outro cliente',
            code: 'CONFLICT' as any
          };
        }

        clienteData.cnpj = cleanCNPJ;
      }

      const { data, error } = await supabase
        .from('clienteslabfy')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        return {
          success: false,
          error: 'Erro ao atualizar cliente',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de atualização de cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async replaceCliente(
    id: string,
    clienteData: CreateClienteRequest
  ): Promise<APIResponse<Cliente>> {
    try {
      // Verifica se cliente existe
      const { data: existing } = await supabase
        .from('clienteslabfy')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Cliente não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      // Limpa CNPJ e verifica duplicatas
      const cleanCNPJ = clienteData.cnpj.replace(/[^\d]/g, '');
      
      const { data: duplicate } = await supabase
        .from('clienteslabfy')
        .select('id')
        .eq('cnpj', cleanCNPJ)
        .neq('id', id)
        .single();

      if (duplicate) {
        return {
          success: false,
          error: 'CNPJ já cadastrado para outro cliente',
          code: 'CONFLICT' as any
        };
      }

      // Atualiza todos os campos obrigatórios
      const { data, error } = await supabase
        .from('clienteslabfy')
        .update({
          razao_social: clienteData.razao_social,
          cnpj: cleanCNPJ,
          endereco_completo: clienteData.endereco_completo,
          cidade_estado: clienteData.cidade_estado,
          assinante_nome: clienteData.assinante_nome,
          assinante_email: clienteData.assinante_email,
          financeiro_nome: clienteData.financeiro_nome,
          financeiro_email: clienteData.financeiro_email,
          financeiro_telefone: clienteData.financeiro_telefone
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao substituir cliente:', error);
        return {
          success: false,
          error: 'Erro ao substituir cliente',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de substituição de cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async deleteCliente(id: string): Promise<APIResponse<void>> {
    try {
      // Verifica se há contratos associados
      const { data: contratos } = await supabase
        .from('contratoslabfy')
        .select('id')
        .eq('cliente_id', id)
        .limit(1);

      if (contratos && contratos.length > 0) {
        return {
          success: false,
          error: 'Não é possível excluir cliente com contratos associados',
          code: 'CONFLICT' as any
        };
      }

      const { error } = await supabase
        .from('clienteslabfy')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar cliente:', error);
        return {
          success: false,
          error: 'Erro ao deletar cliente',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro no serviço de exclusão de cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async getContratosByCliente(id: string): Promise<APIResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('contratoslabfy')
        .select(`
          *,
          projetoslabfy:projeto_id (
            id,
            nome_projeto
          )
        `)
        .eq('cliente_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contratos do cliente:', error);
        return {
          success: false,
          error: 'Erro ao buscar contratos',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro no serviço de contratos do cliente:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }
}

