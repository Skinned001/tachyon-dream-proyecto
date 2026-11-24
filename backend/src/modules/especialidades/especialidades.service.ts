import { Especialidad } from './Especialidad.model.js';

export interface EspecialidadDTO {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export class EspecialidadesService {
  async findAll(): Promise<EspecialidadDTO[]> {
    const specialties = await Especialidad.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
    });

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      active: specialty.active,
    }));
  }
}
