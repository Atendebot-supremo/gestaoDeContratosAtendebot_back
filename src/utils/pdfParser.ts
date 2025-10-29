import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

/**
 * Converte buffer de PDF para HTML básico
 * Extrai texto e preserva estrutura mínima de parágrafos
 */
export const parsePdfToHtml = async (pdfBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(pdfBuffer);

    // Extrai o texto do PDF
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return '<html><body><p>Nenhum texto encontrado no PDF</p></body></html>';
    }

    // Converte texto em HTML básico
    // Divide por quebras de linha e cria parágrafos
    const lines: string[] = text
      .split(/\n+/)
      .filter((line: string) => line.trim().length > 0);

    const paragraphs = lines
      .map((line: string) => `<p>${escapeHtml(line.trim())}</p>`)
      .join('\n');

    // Cria estrutura HTML básica
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Template de Contrato</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
${paragraphs}
</body>
</html>`;

    return html;
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw new Error('Erro ao extrair texto do PDF');
  }
};

/**
 * Escapa caracteres HTML para prevenir XSS
 */
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Converte arquivo do Multer para buffer
 */
export const multerFileToBuffer = (file: Express.Multer.File): Buffer => {
  return Buffer.from(file.buffer);
};

