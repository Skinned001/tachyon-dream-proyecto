import cron from 'node-cron';
import { Op } from 'sequelize';
import { notificarAutoresActivos } from '../../services/notificaciones.service.js';
import { Convocatoria } from './Convocatoria.model.js';

export const sincronizarEstadosConvocatorias = async (): Promise<void> => {
  const ahora = new Date();
  const aperturasPendientes = await Convocatoria.findAll({
    where: {
      estado: 'PROGRAMADA',
      fechaInicio: { [Op.lte]: ahora },
      fechaFin: { [Op.gt]: ahora },
    },
  });

  for (const convocatoria of aperturasPendientes) {
    await notificarAutoresActivos(
      'CONVOCATORIA_ABIERTA',
      `Abrió la convocatoria: ${convocatoria.title}`,
      `La convocatoria ya está abierta y cierra el ${convocatoria.fechaFin.toLocaleString('es-AR')}.`,
      convocatoria.id,
    );
  }

  await Convocatoria.update(
    { estado: 'ABIERTA' },
    {
      where: {
        estado: 'PROGRAMADA',
        fechaInicio: { [Op.lte]: ahora },
        fechaFin: { [Op.gt]: ahora },
      },
    },
  );

  const limiteRecordatorio = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
  const cierresProximos = await Convocatoria.findAll({
    where: {
      estado: 'ABIERTA',
      fechaFin: {
        [Op.gt]: ahora,
        [Op.lte]: limiteRecordatorio,
      },
    },
  });

  for (const convocatoria of cierresProximos) {
    await notificarAutoresActivos(
      'RECORDATORIO_CIERRE',
      `La convocatoria está por cerrar: ${convocatoria.title}`,
      `La convocatoria cierra el ${convocatoria.fechaFin.toLocaleString('es-AR')}.`,
      convocatoria.id,
    );
  }

  await Convocatoria.update(
    { estado: 'CERRADA' },
    {
      where: {
        estado: { [Op.in]: ['ABIERTA', 'PROGRAMADA'] },
        fechaFin: { [Op.lte]: ahora },
      },
    },
  );
};

export const iniciarCronConvocatorias = (): void => {
  cron.schedule('* * * * *', async () => {
    try {
      await sincronizarEstadosConvocatorias();
    } catch (error: unknown) {
      console.error('Error al sincronizar estados de convocatorias:', error);
    }
  });
};
