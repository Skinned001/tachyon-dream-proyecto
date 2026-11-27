import { Op, UniqueConstraintError, fn, col, where } from 'sequelize';
import { Especialidad } from './Especialidad.model.js';

export interface EspecialidadDTO {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export class EspecialidadesError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'EspecialidadesError';
  }
}

export class EspecialidadesService {
  async findAll(includeInactive = false): Promise<EspecialidadDTO[]> {
    const specialties = await Especialidad.findAll({
      ...(includeInactive ? {} : { where: { active: true } }),
      order: [['name', 'ASC']],
    });

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      active: specialty.active,
    }));
  }

  async create(
    input: Pick<EspecialidadDTO, 'name' | 'description'>,
  ): Promise<EspecialidadDTO> {
    const normalizedName = input.name.trim().toLowerCase();
    const duplicate = await Especialidad.findOne({
      where: where(fn('LOWER', col('name')), normalizedName),
    });
    if (duplicate) {
      throw new EspecialidadesError(
        409,
        'Ya existe una especialidad registrada con ese nombre.',
      );
    }

    try {
      const specialty = await Especialidad.create({
        name: input.name.trim(),
        description: input.description.trim(),
        active: true,
      });

      return {
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        active: specialty.active,
      };
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintError) {
        throw new EspecialidadesError(
          409,
          'Ya existe una especialidad registrada con ese nombre.',
        );
      }
      throw error;
    }
  }

  async update(
    id: number,
    updates: Partial<Pick<EspecialidadDTO, 'name' | 'description' | 'active'>>,
  ): Promise<EspecialidadDTO | null> {
    const specialty = await Especialidad.findByPk(id);
    if (!specialty) return null;

    if (updates.name !== undefined) {
      const normalizedName = updates.name.trim().toLowerCase();
      const duplicate = await Especialidad.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.and]: [where(fn('LOWER', col('name')), normalizedName)],
        },
      });
      if (duplicate) {
        throw new EspecialidadesError(
          409,
          'Ya existe otra especialidad registrada con ese nombre.',
        );
      }
      specialty.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      specialty.description = updates.description.trim();
    }
    if (updates.active !== undefined) specialty.active = updates.active;

    try {
      await specialty.save();
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintError) {
        throw new EspecialidadesError(
          409,
          'Ya existe otra especialidad registrada con ese nombre.',
        );
      }
      throw error;
    }

    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      active: specialty.active,
    };
  }
}
