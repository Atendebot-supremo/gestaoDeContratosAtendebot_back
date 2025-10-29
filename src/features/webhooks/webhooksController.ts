import { Request, Response } from 'express';
import { createSuccessResponse } from '../../types';

export default class WebhooksController {
  /**
   * @swagger
   * /api/webhooks/status:
   *   get:
   *     summary: Health check para integração com n8n
   *     tags: [Webhooks]
   *     description: Endpoint para verificar se a API está disponível para receber callbacks do n8n
   *     responses:
   *       200:
   *         description: API disponível
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                     timestamp:
   *                       type: string
   */
  status = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(
      createSuccessResponse({
        status: 'online',
        timestamp: new Date().toISOString()
      })
    );
  };

  /**
   * @swagger
   * /api/webhooks/callback:
   *   post:
   *     summary: Callback do n8n para atualização de status
   *     tags: [Webhooks]
   *     description: Endpoint opcional para o n8n atualizar status de contratos diretamente na API
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               contrato_id:
   *                 type: string
   *                 format: uuid
   *               status:
   *                 type: string
   *               data:
   *                 type: object
   *           example:
   *             contrato_id: "2"
   *             status: "Aguardando Revisão"
   *             data:
   *               url_contrato_gerado: "https://supabase.storage/contratos-gerados/contrato-001.pdf"
   *     responses:
   *       200:
   *         description: Callback recebido
   *       400:
   *         description: Dados inválidos
   */
  callback = async (req: Request, res: Response): Promise<void> => {
    // Este endpoint é opcional, pois o n8n pode atualizar diretamente no Supabase
    // Mas pode ser útil para logging ou processamento adicional
    const { contrato_id, status, data } = req.body;

    // Log do callback (em produção, usar sistema de logs adequado)
    console.log('Callback do n8n recebido:', {
      contrato_id,
      status,
      data,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(
      createSuccessResponse(
        {
          received: true,
          contrato_id,
          status
        },
        'Callback recebido com sucesso'
      )
    );
  };
}

