import { useState, type ChangeEvent } from 'react';

/**
 * Hook genérico para manejar el estado de formularios.
 * @param initialState Objeto con los valores iniciales del formulario.
 */
export const useForm = <
  T extends Record<string, string | number | boolean | null | undefined>,
>(initialState: T) => {
  const [formulario, setFormulario] = useState<T>(initialState);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name } = target;

    if ('checked' in target && target.type === 'checkbox') {
      setFormulario((prev) => ({
        ...prev,
        [name]: target.checked,
      }) as T);
      return;
    }

    setFormulario((prev) => ({
      ...prev,
      [name]: target.value,
    }) as T);
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
