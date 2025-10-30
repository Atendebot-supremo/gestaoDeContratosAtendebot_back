import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ProjetosService } from './projetosService';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode
} from '../../types';

export default class ProjetosController {
  private service = new ProjetosService();

  /**
   * @swagger
   * /api/projetos:
   *   get:
   *     summary: Lista todos os projetos
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de projetos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Projeto'
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.listProjetos();

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/projetos/{id}:
   *   get:
   *     summary: Busca projeto por ID
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do projeto
   *     responses:
   *       200:
   *         description: Dados do projeto
   *       404:
   *         description: Projeto não encontrado
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
    const result = await this.service.getProjetoById(id);

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 500).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };

  /**
   * @swagger
   * /api/projetos:
   *   post:
   *     summary: Cria novo projeto
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - nome_projeto
   *             properties:
   *               nome_projeto:
   *                 type: string
   *                 description: Nome do projeto
   *               descricao:
   *                 type: string
   *                 description: Descrição do projeto
   *               pdf_file:
   *                 type: string
   *                 format: binary
   *                 description: Arquivo PDF do template
   *           example:
   *             nome_projeto: "Projetos Labfy"
   *             descricao: "Modelo base de contratos Labfy"
   *     responses:
   *       201:
   *         description: Projeto criado com sucesso
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

    const projetoData = {
      nome_projeto: req.body.nome_projeto,
      descricao: req.body.descricao || undefined
    };

    const pdfFile = req.file as Express.Multer.File | undefined;

    const result = await this.service.createProjeto(projetoData, pdfFile);

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
      createSuccessResponse(result.data, 'Projeto criado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/projetos/{id}:
   *   patch:
   *     summary: Atualiza projeto
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do projeto
   *     requestBody:
   *       required: false
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               nome_projeto:
   *                 type: string
   *               descricao:
   *                 type: string
   *               pdf_file:
   *                 type: string
   *                 format: binary
   *           example:
   *             nome_projeto: "Projetos Labfy (v2)"
   *             descricao: "Ajuste do template e layout"
   *     responses:
   *       200:
   *         description: Projeto atualizado com sucesso
   *       404:
   *         description: Projeto não encontrado
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
    const projetoData = {
      nome_projeto: req.body.nome_projeto,
      descricao: req.body.descricao
    };

    // Remove campos undefined
    Object.keys(projetoData).forEach(
      (key) =>
        projetoData[key as keyof typeof projetoData] === undefined &&
        delete projetoData[key as keyof typeof projetoData]
    );

    const pdfFile = req.file as Express.Multer.File | undefined;

    const result = await this.service.updateProjeto(id, projetoData, pdfFile);

    if (!result.success) {
      const statusCode =
        result.code === 'INVALID_INPUT'
          ? 400
          : result.code === 'NOT_FOUND'
          ? 404
          : result.code === 'CONFLICT'
          ? 409
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'Projeto atualizado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/projetos/{id}:
   *   put:
   *     summary: Substitui projeto completamente (todos os campos obrigatórios)
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do projeto
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [nome_projeto]
   *             properties:
   *               nome_projeto:
   *                 type: string
   *               descricao:
   *                 type: string
   *               pdf_file:
   *                 type: string
   *                 format: binary
   *           example:
   *             nome_projeto: "Projetos Labfy"
   *             descricao: "Descrição do projeto"
   *     responses:
   *       200:
   *         description: Projeto substituído com sucesso
   *       404:
   *         description: Projeto não encontrado
   */
  replace = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
      return;
    }

    const { id } = req.params;
    const projetoData = {
      nome_projeto: req.body.nome_projeto,
      descricao: req.body.descricao || undefined
    };

    const pdfFile = req.file as Express.Multer.File | undefined;

    const result = await this.service.replaceProjeto(id, projetoData, pdfFile);

    if (!result.success) {
      const statusCode =
        result.code === 'INVALID_INPUT'
          ? 400
          : result.code === 'NOT_FOUND'
          ? 404
          : result.code === 'CONFLICT'
          ? 409
          : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'Projeto substituído com sucesso')
    );
  };

  /**
   * @swagger
   * /api/projetos/{id}:
   *   delete:
   *     summary: Deleta projeto
   *     tags: [Projetos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID do projeto
   *     responses:
   *       200:
   *         description: Projeto deletado com sucesso
   *       404:
   *         description: Projeto não encontrado
   *       409:
   *         description: Projeto possui contratos associados
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
    const result = await this.service.deleteProjeto(id);

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
      createSuccessResponse(null, 'Projeto deletado com sucesso')
    );
  };
}

