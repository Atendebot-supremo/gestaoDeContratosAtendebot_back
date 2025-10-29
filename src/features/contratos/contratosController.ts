import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ContratosService } from './contratosService';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode
} from '../../types';
import { ContratoFilters } from './types';

export default class ContratosController {
  private service = new ContratosService();

  /**
   * @swagger
   * /api/contratos:
   *   get:
   *     summary: Lista todos os contratos
   *     tags: [Contratos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [Aguardando Geração, Aguardando Revisão, Enviado, Ativo, Cancelado]
   *         description: Filtrar por status
   *       - in: query
   *         name: cliente_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filtrar por cliente
   *       - in: query
   *         name: projeto_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filtrar por projeto
   *     responses:
   *       200:
   *         description: Lista de contratos
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const filters: ContratoFilters = {
      status: req.query.status as any,
      cliente_id: req.query.cliente_id as string | undefined,
      projeto_id: req.query.projeto_id as string | undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof ContratoFilters] === undefined &&
        delete filters[key as keyof ContratoFilters]
    );

    const result = await this.service.listContratos(filters);

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/contratos/{id}:
   *   get:
   *     summary: Busca contrato por ID
   *     tags: [Contratos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do contrato
   *     responses:
   *       200:
   *         description: Dados do contrato
   *       404:
   *         description: Contrato não encontrado
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
      return;
    }

    const { id } = req.params;
    const result = await this.service.getContratoById(id);

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/contratos:
   *   post:
   *     summary: Cria novo contrato
   *     tags: [Contratos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cliente_id
   *               - projeto_id
   *               - valor_mensalidade
   *               - valor_setup
   *               - plano_nome
   *             properties:
   *               cliente_id:
   *                 type: string
   *                 format: uuid
   *               projeto_id:
   *                 type: string
   *                 format: uuid
   *               valor_mensalidade:
   *                 type: string
   *               valor_setup:
   *                 type: string
   *               plano_nome:
   *                 type: string
   *               observacoes_ia:
   *                 type: string
   *           example:
   *             cliente_id: "2"
   *             projeto_id: "1"
   *             plano_nome: "Plano Scale"
   *             valor_mensalidade: "799.00"
   *             valor_setup: "4000.00"
   *             prazo_implementacao_dias: 15
   *             provedor_openai: "Labfy"
   *             forma_pagamento: "Cartão de Crédito"
   *             observacoes_ia: "este cliente deve ter uma clausula de confidencialidade."
   *             assinante_venda_nome: "Enzo Lacerda"
   *             assinante_venda_email: "enzo@hawkmarketing.digital"
   *     responses:
   *       201:
   *         description: Contrato criado com sucesso
   *       400:
   *         description: Dados inválidos
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
      return;
    }

    const result = await this.service.createContrato(req.body);

    if (!result.success) {
      const statusCode =
        result.code === 'INVALID_INPUT'
          ? 400
          : result.code === 'NOT_FOUND'
          ? 404
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(201).json(
      createSuccessResponse(result.data, 'Contrato criado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/contratos/{id}:
   *   patch:
   *     summary: Atualiza contrato
   *     tags: [Contratos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do contrato
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [Aguardando Geração, Aguardando Revisão, Enviado, Ativo, Cancelado]
   *           example:
   *             status: "Aguardando Revisão"
   *     responses:
   *       200:
   *         description: Contrato atualizado com sucesso
   *       403:
   *         description: Contrato não pode ser editado neste status
   *       404:
   *         description: Contrato não encontrado
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
      return;
    }

    const { id } = req.params;
    const result = await this.service.updateContrato(id, req.body);

    if (!result.success) {
      const statusCode =
        result.code === 'INVALID_INPUT'
          ? 400
          : result.code === 'NOT_FOUND'
          ? 404
          : result.code === 'FORBIDDEN'
          ? 403
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'Contrato atualizado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/contratos/{id}:
   *   delete:
   *     summary: Deleta contrato
   *     tags: [Contratos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               motivo:
   *                 type: string
   *           example:
   *             motivo: "Cancelamento administrativo"
   *         description: ID do contrato
   *     responses:
   *       200:
   *         description: Contrato deletado com sucesso
   *       404:
   *         description: Contrato não encontrado
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
      return;
    }

    const { id } = req.params;
    const result = await this.service.deleteContrato(id);

    if (!result.success) {
      const statusCode =
        result.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(null, 'Contrato deletado com sucesso')
    );
  };
}

