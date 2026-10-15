import { sequelize } from '../config/database.js';
import { Articulo, initializeArticuloModel } from '../modules/articulos/Articulo.model.js';
import {
  ArticuloVersion,
  initializeArticuloVersionModel,
} from '../modules/articulos/ArticuloVersion.model.js';
import {
  RecursoBiblioteca,
  initializeRecursoBibliotecaModel,
} from '../modules/biblioteca/RecursoBiblioteca.model.js';
import {
  Convocatoria,
  initializeConvocatoriaModel,
} from '../modules/editorial/Convocatoria.model.js';
import {
  AsignacionComite,
  initializeAsignacionComiteModel,
} from '../modules/editorial/AsignacionComite.model.js';
import { Revision, initializeRevisionModel } from '../modules/editorial/Revision.model.js';
import {
  Especialidad,
  initializeEspecialidadModel,
} from '../modules/especialidades/Especialidad.model.js';
import {
  Notificacion,
  initializeNotificacionModel,
} from '../modules/notificaciones/Notificacion.model.js';
import { Rol, initializeRolModel } from '../modules/usuarios/Rol.model.js';
import { Usuario, initializeUsuarioModel } from '../modules/usuarios/Usuario.model.js';

let associationsConfigured = false;

export const setupAssociations = (): void => {
  if (associationsConfigured) {
    return;
  }

  initializeRolModel(sequelize);
  initializeEspecialidadModel(sequelize);
  initializeUsuarioModel(sequelize);
  initializeConvocatoriaModel(sequelize);
  initializeArticuloModel(sequelize);
  initializeArticuloVersionModel(sequelize);
  initializeAsignacionComiteModel(sequelize);
  initializeRevisionModel(sequelize);
  initializeRecursoBibliotecaModel(sequelize);
  initializeNotificacionModel(sequelize);

  Rol.hasMany(Usuario, { foreignKey: 'roleId', as: 'users' });
  Usuario.belongsTo(Rol, { foreignKey: 'roleId', as: 'role' });

  Especialidad.hasMany(Usuario, { foreignKey: 'specialtyId', as: 'users' });
  Usuario.belongsTo(Especialidad, { foreignKey: 'specialtyId', as: 'specialty' });

  Usuario.hasMany(Articulo, { foreignKey: 'responsibleId', as: 'responsibleArticles' });
  Articulo.belongsTo(Usuario, { foreignKey: 'responsibleId', as: 'responsible' });

  Especialidad.hasMany(Articulo, { foreignKey: 'specialtyId', as: 'articles' });
  Articulo.belongsTo(Especialidad, { foreignKey: 'specialtyId', as: 'specialty' });

  Convocatoria.hasMany(Articulo, { foreignKey: 'convocationId', as: 'articles' });
  Articulo.belongsTo(Convocatoria, { foreignKey: 'convocationId', as: 'convocation' });

  Articulo.hasMany(ArticuloVersion, { foreignKey: 'articleId', as: 'versions' });
  ArticuloVersion.belongsTo(Articulo, { foreignKey: 'articleId', as: 'article' });

  Usuario.hasMany(AsignacionComite, { foreignKey: 'reviewerId', as: 'committeeAssignments' });
  AsignacionComite.belongsTo(Usuario, { foreignKey: 'reviewerId', as: 'reviewer' });

  Articulo.hasMany(AsignacionComite, { foreignKey: 'articleId', as: 'committeeAssignments' });
  AsignacionComite.belongsTo(Articulo, { foreignKey: 'articleId', as: 'article' });

  AsignacionComite.hasMany(Revision, { foreignKey: 'assignmentId', as: 'reviews' });
  Revision.belongsTo(AsignacionComite, { foreignKey: 'assignmentId', as: 'assignment' });

  ArticuloVersion.hasMany(Revision, { foreignKey: 'versionId', as: 'reviews' });
  Revision.belongsTo(ArticuloVersion, { foreignKey: 'versionId', as: 'version' });

  Usuario.hasMany(RecursoBiblioteca, { foreignKey: 'uploadedBy', as: 'uploadedResources' });
  RecursoBiblioteca.belongsTo(Usuario, { foreignKey: 'uploadedBy', as: 'uploader' });

  Especialidad.hasMany(RecursoBiblioteca, { foreignKey: 'specialtyId', as: 'libraryResources' });
  RecursoBiblioteca.belongsTo(Especialidad, { foreignKey: 'specialtyId', as: 'specialty' });

  Usuario.hasMany(Notificacion, { foreignKey: 'userId', as: 'notifications' });
  Notificacion.belongsTo(Usuario, { foreignKey: 'userId', as: 'user' });

  associationsConfigured = true;
};
