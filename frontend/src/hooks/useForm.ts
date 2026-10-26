import { useState, type ChangeEvent } from 'react';

/**
 * Hook genérico para manejar el estado de formularios.
 * @param initialState Objeto con los valores iniciales del formulario.
 */
export const useForm = <T extends Record<string, string>>(initialState: T) => {
  const [formulario, setFormulario] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormulario(initialState);
  };

  return {
    formulario,
    handleChange,
    resetForm,
    setFormulario,
  };
};
