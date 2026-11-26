import { Especialidad } from './Especialidad.model.js';

export interface EspecialidadDTO {
  id: number;
  name: string;
  description: string;
  active: boolean;
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

  async create(input: Pick<EspecialidadDTO, 'name' | 'description'>): Promise<EspecialidadDTO> {
    const specialty = await Especialidad.create({
      ...input,
      active: true,
    });

    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      active: specialty.active,
    };
  }

  async update(
    id: number,
    updates: Partial<Pick<EspecialidadDTO, 'name' | 'description' | 'active'>>,
  ): Promise<EspecialidadDTO | null> {
    const specialty = await Especialidad.findByPk(id);
    if (!specialty) return null;

    if (updates.name !== undefined) specialty.name = updates.name;
    if (updates.description !== undefined) {
      specialty.description = updates.description;
    }
    if (updates.active !== undefined) specialty.active = updates.active;

    await specialty.save();

    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      active: specialty.active,
    };
  }
}
