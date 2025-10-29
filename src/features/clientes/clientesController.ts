import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ClientesService } from './clientesService';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode
} from '../../types';

export default class ClientesController {
  private service = new ClientesService();

  /**
   * @swagger
   * /api/clientes:
   *   get:
   *     summary: Lista todos os clientes
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: cnpj
   *         schema:
   *           type: string
   *         description: Filtrar por CNPJ (parcial)
   *       - in: query
   *         name: razao_social
   *         schema:
   *           type: string
   *         description: Filtrar por razão social (parcial)
   *     responses:
   *       200:
   *         description: Lista de clientes
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      cnpj: req.query.cnpj as string | undefined,
      razao_social: req.query.razao_social as string | undefined
    };

    const result = await this.service.listClientes(filters);

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/clientes/{id}:
   *   get:
   *     summary: Busca cliente por ID
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Dados do cliente com contratos associados
   *       404:
   *         description: Cliente não encontrado
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await this.service.getClienteById(id);

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/clientes:
   *   post:
   *     summary: Cria novo cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [razao_social, cnpj]
   *             properties:
   *               razao_social:
   *                 type: string
   *               cnpj:
   *                 type: string
   *               endereco_completo:
   *                 type: string
   *               cidade_estado:
   *                 type: string
   *               assinante_nome:
   *                 type: string
   *               assinante_email:
   *                 type: string
   *               financeiro_nome:
   *                 type: string
   *               financeiro_email:
   *                 type: string
   *               financeiro_telefone:
   *                 type: string
   *           example:
   *             razao_social: "Teste da Silva LTDA"
   *             cnpj: "65.870.392/0001-95"
   *             endereco_completo: "Rua Joaquim Saraiva, Sala 201 - Bairro Centro"
   *             cidade_estado: "Uberlândia/MG"
   *             assinante_nome: "Enzo Lacerda"
   *             assinante_email: "enzo@hawkmarketing.digital"
   *             financeiro_nome: "Enzo Lacerda"
   *             financeiro_email: "enzo@hawkmarketing.digital"
   *             financeiro_telefone: "(34) 99672-6971"
   *     responses:
   *       201:
   *         description: Cliente criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: CNPJ já cadastrado
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse(
          'Dados inválidos',
          ErrorCode.INVALID_INPUT,
          errors.array()[0].msg
        )
      );
      return;
    }

    const result = await this.service.createCliente(req.body);

    if (!result.success) {
      const statusCode =
        result.code === 'CONFLICT'
          ? 409
          : result.code === 'NOT_FOUND'
          ? 404
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(201).json(
      createSuccessResponse(result.data, 'Cliente criado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/clientes/{id}:
   *   patch:
   *     summary: Atualiza cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               razao_social:
   *                 type: string
   *               cnpj:
   *                 type: string
   *               endereco_completo:
   *                 type: string
   *               cidade_estado:
   *                 type: string
   *               assinante_nome:
   *                 type: string
   *               assinante_email:
   *                 type: string
   *               financeiro_nome:
   *                 type: string
   *               financeiro_email:
   *                 type: string
   *               financeiro_telefone:
   *                 type: string
   *           example:
   *             razao_social: "Teste da Silva LTDA (Atualizado)"
   *             cidade_estado: "Uberaba/MG"
   *     responses:
   *       200:
   *         description: Cliente atualizado com sucesso
   *       404:
   *         description: Cliente não encontrado
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse(
          'Dados inválidos',
          ErrorCode.INVALID_INPUT,
          errors.array()[0].msg
        )
      );
      return;
    }

    const { id } = req.params;
    const result = await this.service.updateCliente(id, req.body);

    if (!result.success) {
      const statusCode =
        result.code === 'NOT_FOUND'
          ? 404
          : result.code === 'CONFLICT'
          ? 409
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'Cliente atualizado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/clientes/{id}:
   *   delete:
   *     summary: Exclui cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
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
   *             motivo: "Duplicado"
   *     responses:
   *       200:
   *         description: Cliente excluído com sucesso
   *       404:
   *         description: Cliente não encontrado
   *       409:
   *         description: Cliente possui contratos associados
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.deleteCliente(id);

    if (!result.success) {
      const statusCode =
        result.code === 'NOT_FOUND'
          ? 404
          : result.code === 'CONFLICT'
          ? 409
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(null, 'Cliente excluído com sucesso')
    );
  };

  /**
   * @swagger
   * /api/clientes/{id}/contratos:
   *   get:
   *     summary: Lista contratos do cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de contratos do cliente
   */
  getContratos = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.getContratosByCliente(id);

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };
}

