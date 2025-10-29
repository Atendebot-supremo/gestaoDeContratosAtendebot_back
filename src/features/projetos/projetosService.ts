import { supabase } from '../../config/supabase';
import { Projeto, CreateProjetoRequest, UpdateProjetoRequest } from './types';
import { APIResponse } from '../../types';
import { uploadTemplatePDF, deleteFile } from '../../config/storage';
import { parsePdfToHtml, multerFileToBuffer } from '../../utils/pdfParser';

export class ProjetosService {
  async listProjetos(): Promise<APIResponse<Projeto[]>> {
    try {
      const { data, error } = await supabase
        .from('projetoslabfy')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar projetos:', error);
        return {
          success: false,
          error: 'Erro ao buscar projetos',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro no serviço de projetos:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async getProjetoById(id: string): Promise<APIResponse<Projeto>> {
    try {
      const { data, error } = await supabase
        .from('projetoslabfy')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Projeto não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async createProjeto(
    projetoData: CreateProjetoRequest,
    pdfFile?: Express.Multer.File
  ): Promise<APIResponse<Projeto>> {
    try {
      let templatePdfPath: string | undefined;
      let templateHtml: string | undefined;

      // Se há arquivo PDF, processa upload e conversão
      if (pdfFile) {
        // Valida tipo de arquivo
        if (pdfFile.mimetype !== 'application/pdf') {
          return {
            success: false,
            error: 'Apenas arquivos PDF são permitidos',
            code: 'INVALID_INPUT' as any
          };
        }

        // Valida tamanho (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (pdfFile.size > maxSize) {
          return {
            success: false,
            error: 'Arquivo muito grande. Máximo 10MB',
            code: 'INVALID_INPUT' as any
          };
        }

        // Gera nome único para o arquivo
        const timestamp = Date.now();
        const fileName = `template-${timestamp}-${pdfFile.originalname}`;

        // Converte arquivo para buffer
        const fileBuffer = multerFileToBuffer(pdfFile);

        // Faz upload para Supabase Storage
        templatePdfPath = await uploadTemplatePDF(fileName, fileBuffer);

        // Extrai HTML do PDF
        templateHtml = await parsePdfToHtml(fileBuffer);
      }

      // Insere projeto no banco
      const { data, error } = await supabase
        .from('projetoslabfy')
        .insert({
          nome_projeto: projetoData.nome_projeto,
          descricao: projetoData.descricao,
          template_pdf_path: templatePdfPath,
          template_html: templateHtml
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar projeto:', error);
        // Se houve erro após upload, tenta limpar arquivo
        if (templatePdfPath) {
          try {
            const fileName = templatePdfPath.split('/').pop() || '';
            await deleteFile('templates', fileName);
          } catch (cleanupError) {
            console.error('Erro ao limpar arquivo após falha:', cleanupError);
          }
        }
        return {
          success: false,
          error: 'Erro ao criar projeto',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de criação de projeto:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async updateProjeto(
    id: string,
    projetoData: UpdateProjetoRequest,
    pdfFile?: Express.Multer.File
  ): Promise<APIResponse<Projeto>> {
    try {
      // Verifica se projeto existe
      const { data: existing } = await supabase
        .from('projetoslabfy')
        .select('id, template_pdf_path')
        .eq('id', id)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Projeto não encontrado',
          code: 'NOT_FOUND' as any
        };
      }

      let templatePdfPath: string | undefined = existing.template_pdf_path;
      let templateHtml: string | undefined;

      // Se há novo arquivo PDF, processa upload e conversão
      if (pdfFile) {
        // Valida tipo e tamanho
        if (pdfFile.mimetype !== 'application/pdf') {
          return {
            success: false,
            error: 'Apenas arquivos PDF são permitidos',
            code: 'INVALID_INPUT' as any
          };
        }

        const maxSize = 10 * 1024 * 1024;
        if (pdfFile.size > maxSize) {
          return {
            success: false,
            error: 'Arquivo muito grande. Máximo 10MB',
            code: 'INVALID_INPUT' as any
          };
        }

        // Deleta arquivo antigo se existir
        if (existing.template_pdf_path) {
          try {
            const oldFileName = existing.template_pdf_path.split('/').pop() || '';
            await deleteFile('templates', oldFileName);
          } catch (cleanupError) {
            console.error('Erro ao deletar arquivo antigo:', cleanupError);
            // Continua mesmo se não conseguir deletar
          }
        }

        // Faz upload do novo arquivo
        const timestamp = Date.now();
        const fileName = `template-${timestamp}-${pdfFile.originalname}`;
        const fileBuffer = multerFileToBuffer(pdfFile);

        templatePdfPath = await uploadTemplatePDF(fileName, fileBuffer);
        templateHtml = await parsePdfToHtml(fileBuffer);
      }

      // Atualiza projeto
      const updateData: any = {
        ...projetoData
      };

      if (pdfFile) {
        updateData.template_pdf_path = templatePdfPath;
        updateData.template_html = templateHtml;
      }

      const { data, error } = await supabase
        .from('projetoslabfy')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        return {
          success: false,
          error: 'Erro ao atualizar projeto',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro no serviço de atualização de projeto:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async deleteProjeto(id: string): Promise<APIResponse<void>> {
    try {
      // Verifica se há contratos usando este projeto
      const { data: contratos } = await supabase
        .from('contratoslabfy')
        .select('id')
        .eq('projeto_id', id)
        .limit(1);

      if (contratos && contratos.length > 0) {
        return {
          success: false,
          error: 'Não é possível excluir projeto com contratos associados',
          code: 'CONFLICT' as any
        };
      }

      // Busca projeto para deletar arquivo do Storage
      const { data: projeto } = await supabase
        .from('projetoslabfy')
        .select('template_pdf_path')
        .eq('id', id)
        .single();

      // Deleta arquivo do Storage se existir
      if (projeto?.template_pdf_path) {
        try {
          const fileName = projeto.template_pdf_path.split('/').pop() || '';
          await deleteFile('templates', fileName);
        } catch (cleanupError) {
          console.error('Erro ao deletar arquivo do Storage:', cleanupError);
          // Continua mesmo se não conseguir deletar arquivo
        }
      }

      // Deleta projeto do banco
      const { error } = await supabase
        .from('projetoslabfy')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar projeto:', error);
        return {
          success: false,
          error: 'Erro ao deletar projeto',
          code: 'INTERNAL_SERVER_ERROR' as any
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro no serviço de exclusão de projeto:', error);
      return {
        success: false,
        error: 'Erro ao processar requisição',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }
}

