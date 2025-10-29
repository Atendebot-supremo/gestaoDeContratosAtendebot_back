import { supabase } from './supabase';

export const TEMPLATES_BUCKET = 'templates';
export const CONTRATOS_GERADOS_BUCKET = 'contratos-gerados';

/**
 * Faz upload de arquivo para o Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string = 'application/pdf'
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true // Substitui arquivo se já existir
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obtém URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Erro ao obter URL pública do arquivo');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    throw error;
  }
};

/**
 * Upload de template PDF
 */
export const uploadTemplatePDF = async (
  fileName: string,
  fileBuffer: Buffer
): Promise<string> => {
  return uploadFile(TEMPLATES_BUCKET, fileName, fileBuffer, 'application/pdf');
};

/**
 * Upload de contrato gerado (usado pelo n8n, mas disponível aqui também)
 */
export const uploadContratoGerado = async (
  fileName: string,
  fileBuffer: Buffer
): Promise<string> => {
  return uploadFile(
    CONTRATOS_GERADOS_BUCKET,
    fileName,
    fileBuffer,
    'application/pdf'
  );
};

/**
 * Deleta arquivo do Storage
 */
export const deleteFile = async (
  bucket: string,
  fileName: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro na exclusão de arquivo:', error);
    throw error;
  }
};

