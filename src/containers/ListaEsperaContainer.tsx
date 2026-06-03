import React, { useState } from 'react';
import { AtencionBase, EstadoAtencion } from '../hooks/useListasEspera';
import { ListaEsperaTable } from '../components/ListaEsperaTable';

export interface ListaEsperaContainerProps {
  atenciones: AtencionBase[];
  onActualizarEstado: (id: number, nuevoEstado: EstadoAtencion) => Promise<any>;
  onCancelarYReasignar: (id: number) => Promise<any>;
  onVerDetalle?: (atencion: AtencionBase) => void;
}

export const ListaEsperaContainer: React.FC<ListaEsperaContainerProps> = ({
  atenciones,
  onActualizarEstado,
  onCancelarYReasignar,
  onVerDetalle
}) => {
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelarYReasignar = async (id: number) => {
    setBuscando(true);
    setError(null);
    try {
      await onCancelarYReasignar(id);
    } catch (e: any) {
      console.error(e);
      const errMsg = e.message || 'Error en el servidor al intentar reasignar el cupo.';
      setError(errMsg);
      throw e;
    } finally {
      setBuscando(false);
    }
  };

  const handleActualizarEstado = async (id: number, nuevoEstado: EstadoAtencion) => {
    setBuscando(true);
    setError(null);
    try {
      await onActualizarEstado(id, nuevoEstado);
    } catch (e: any) {
      console.error(e);
      const errMsg = e.message || 'Error al intentar actualizar el estado de la atención.';
      setError(errMsg);
      throw e;
    } finally {
      setBuscando(false);
    }
  };

  return (
    <ListaEsperaTable
      atenciones={atenciones}
      buscando={buscando}
      error={error}
      onErrorClose={() => setError(null)}
      onActualizarEstado={handleActualizarEstado}
      onCancelarYReasignar={handleCancelarYReasignar}
      onVerDetalle={onVerDetalle}
    />
  );
};

export default ListaEsperaContainer;
