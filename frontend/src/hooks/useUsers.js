import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usuariosApi from '../api/usuarios.api';

export const USERS_QUERY_KEY = ['usuarios'];
export const ROLES_QUERY_KEY = ['roles'];

export const useUsersList = (filters = {}) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],
    queryFn: () => usuariosApi.listar(filters),
    select: (data) => ({
      usuarios: data.usuarios,
      paginacion: data.paginacion,
    }),
    staleTime: 60 * 1000,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: usuariosApi.listarRoles,
    staleTime: 60 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuariosApi.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => usuariosApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useToggleUserState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }) => usuariosApi.cambiarEstado(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rol_id }) => usuariosApi.cambiarRol(id, rol_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};


