import bcrypt from 'bcryptjs';
import { Op, type WhereOptions } from 'sequelize';
import { Articulo } from '../articulos/Articulo.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import { notificarAutoresActivos } from '../../services/notificaciones.service.js';
import { Convocatoria } from './Convocatoria.model.js';

export type ConvocatoriaEstado = 'BORRADOR' | 'PROGRAMADA' | 'ABIERTA' | 'CERRADA';

export interface ConvocatoriaDTO {
  id: number;
  title: string;
  fechaInicio: string;
  fechaFin: string;
  estado: ConvocatoriaEstado;
  visibleEnLanding: boolean;
  articulosPublicadosCount?: number;
}

export interface CreateConvocatoriaInput {
  title: string;
  fechaInicio: Date;
  fechaFin: Date;
  visibleEnLanding?: boolean;
  estado?: ConvocatoriaEstado;
}

export interface UpdateConvocatoriaInput {
  title?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  visibleEnLanding?: boolean;
  estado?: ConvocatoriaEstado;
  password: string;
}

export class EditorialError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

const toDTO = (
  convocatoria: Convocatoria,
  articulosPublicadosCount?: number,
): ConvocatoriaDTO => ({
  id: convocatoria.id,
  title: convocatoria.title,
  fechaInicio: convocatoria.fechaInicio.toISOString(),
  fechaFin: convocatoria.fechaFin.toISOString(),
  estado: convocatoria.estado,
  visibleEnLanding: convocatoria.visibleEnLanding,
  ...(articulosPublicadosCount !== undefined ? { articulosPublicadosCount } : {}),
});

const validatePassword = async (userId: number, password: string): Promise<void> => {
  const user = await Usuario.findByPk(userId);
  if (!user) {
    throw new EditorialError(401, 'Usuario autenticado no encontrado');
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new EditorialError(401, 'Contraseña incorrecta');
  }
};

export class EditorialService {
  async listarConvocatorias(): Promise<ConvocatoriaDTO[]> {
    const convocatorias = await Convocatoria.findAll({ order: [['fechaInicio', 'ASC']] });
    return convocatorias.map((convocatoria) => toDTO(convocatoria));
  }

  async crearConvocatoria(input: CreateConvocatoriaInput): Promise<ConvocatoriaDTO> {
    const ahora = new Date();
    const fechaInicioMinima = new Date(ahora.getTime() - 2 * 60 * 1000);
    if (input.fechaFin <= ahora) {
      throw new EditorialError(400, 'fechaFin debe ser posterior al momento actual');
    }
    if (input.fechaInicio < fechaInicioMinima) {
      throw new EditorialError(400, 'fechaInicio no puede ser anterior al momento actual');
    }
    if (input.fechaFin <= input.fechaInicio) {
      throw new EditorialError(400, 'fechaFin debe ser posterior a fechaInicio');
    }

    const estado: ConvocatoriaEstado =
      input.estado === 'BORRADOR'
        ? 'BORRADOR'
        : input.fechaInicio <= new Date()
          ? 'ABIERTA'
          : 'PROGRAMADA';

    const convocatoria = await Convocatoria.create({
      title: input.title,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      visibleEnLanding: input.visibleEnLanding ?? false,
      estado,
    });
    if (estado === 'ABIERTA') {
      await notificarAutoresActivos(
        'CONVOCATORIA_ABIERTA',
        `Abrió la convocatoria: ${convocatoria.title}`,
        `La convocatoria ya está abierta y cierra el ${convocatoria.fechaFin.toLocaleString('es-AR')}.`,
        convocatoria.id,
      );
    }
    return toDTO(convocatoria);
  }

  async editarConvocatoria(
    id: number,
    userId: number,
    input: UpdateConvocatoriaInput,
  ): Promise<ConvocatoriaDTO> {
    await validatePassword(userId, input.password);

    const convocatoria = await Convocatoria.findByPk(id);
    if (!convocatoria) {
      throw new EditorialError(404, 'Convocatoria no encontrada');
    }
    if (convocatoria.estado === 'ABIERTA' && input.fechaInicio !== undefined) {
      throw new EditorialError(400, 'No se puede modificar fechaInicio mientras la convocatoria está ABIERTA');
    }

    const fechaInicio = input.fechaInicio ?? convocatoria.fechaInicio;
    const fechaFin = input.fechaFin ?? convocatoria.fechaFin;
    if (fechaFin <= fechaInicio) {
      throw new EditorialError(400, 'fechaFin debe ser posterior a fechaInicio');
    }

    const estabaAbierta = convocatoria.estado === 'ABIERTA';
    await convocatoria.update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.fechaInicio !== undefined ? { fechaInicio: input.fechaInicio } : {}),
      ...(input.fechaFin !== undefined ? { fechaFin: input.fechaFin } : {}),
      ...(input.visibleEnLanding !== undefined
        ? { visibleEnLanding: input.visibleEnLanding }
        : {}),
      ...(input.estado !== undefined ? { estado: input.estado } : {}),
    });

    if (!estabaAbierta && convocatoria.estado === 'ABIERTA') {
      await notificarAutoresActivos(
        'CONVOCATORIA_ABIERTA',
        `Abrió la convocatoria: ${convocatoria.title}`,
        `La convocatoria ya está abierta y cierra el ${convocatoria.fechaFin.toLocaleString('es-AR')}.`,
        convocatoria.id,
      );
    }

    return toDTO(convocatoria);
  }

  async finalizarConvocatoria(
    id: number,
    userId: number,
    password: string,
  ): Promise<ConvocatoriaDTO> {
    await validatePassword(userId, password);

    const convocatoria = await Convocatoria.findByPk(id);
    if (!convocatoria) {
      throw new EditorialError(404, 'Convocatoria no encontrada');
    }
    if (convocatoria.estado !== 'ABIERTA') {
      throw new EditorialError(400, 'Solo se pueden finalizar convocatorias en estado ABIERTA');
    }

    await notificarAutoresActivos(
      'CONVOCATORIA_CERRADA',
      `Se cerró la convocatoria: ${convocatoria.title}`,
      'La convocatoria finalizó anticipadamente y ya no recibe manuscritos.',
      convocatoria.id,
    );
    await convocatoria.update({ estado: 'CERRADA', fechaFin: new Date() });
    return toDTO(convocatoria);
  }

  async listarPublicas(): Promise<{
    abiertas: ConvocatoriaDTO[];
    proximas: ConvocatoriaDTO[];
    cerradas: ConvocatoriaDTO[];
  }> {
    const ahora = new Date();
    const hace60Dias = new Date(ahora);
    hace60Dias.setDate(hace60Dias.getDate() - 60);

    const [abiertas, proximas, cerradas] = await Promise.all([
      Convocatoria.findAll({ where: { estado: 'ABIERTA' }, order: [['fechaInicio', 'ASC']] }),
      Convocatoria.findAll({
        where: { estado: 'PROGRAMADA', visibleEnLanding: true },
        order: [['fechaInicio', 'ASC']],
      }),
      Convocatoria.findAll({
        where: {
          estado: 'CERRADA',
          fechaFin: { [Op.gte]: hace60Dias },
        } as WhereOptions,
        order: [['fechaFin', 'DESC']],
      }),
    ]);

    const cerradasConConteo = await Promise.all(
      cerradas.map(async (convocatoria) => {
        const count = await Articulo.count({
          where: { convocatoriaId: convocatoria.id, state: 'PUBLICADO' },
        });
        return toDTO(convocatoria, count);
      }),
    );

    return {
      abiertas: abiertas.map((convocatoria) => toDTO(convocatoria)),
      proximas: proximas.map((convocatoria) => toDTO(convocatoria)),
      cerradas: cerradasConConteo,
    };
  }
}
