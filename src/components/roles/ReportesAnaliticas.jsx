import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, BarChart2, DollarSign } from 'lucide-react';

const ReportesAnaliticas = ({ onBack }) => {
  const [courseReport, setCourseReport] = useState([]);
  const [financialReport, setFinancialReport] = useState([]); // Nuevo estado para el reporte financiero
  const [loading, setLoading] = useState(true);
  const [activeSemestre, setActiveSemestre] = useState(null);

  useEffect(() => {
    const generateReport = async () => {
      setLoading(true);

      // 1. Buscar el semestre activo
      const semestresQuery = query(collection(db, 'semestres'), where('estado', '==', 'activo'));
      const semestresSnapshot = await getDocs(semestresQuery);
      
      if (semestresSnapshot.empty) {
        setActiveSemestre(null);
        setLoading(false);
        return;
      }
      
      const activeSemestreData = { id: semestresSnapshot.docs[0].id, ...semestresSnapshot.docs[0].data() };
      setActiveSemestre(activeSemestreData);

      // 2. Generar reporte de cursos (sin cambios)
      const cursosQuery = query(collection(db, 'cursos'), where('semestreId', '==', activeSemestreData.id));
      const cursosSnapshot = await getDocs(cursosQuery);
      const report = [];
      for (const cursoDoc of cursosSnapshot.docs) {
        const cursoData = { id: cursoDoc.id, ...cursoDoc.data() };
        const calificaciones = cursoData.calificaciones || {};
        const notas = Object.values(calificaciones).map(nota => parseFloat(nota)).filter(n => !isNaN(n));
        let promedio = 0;
        if (notas.length > 0) {
          promedio = (notas.reduce((acc, n) => acc + n, 0) / notas.length).toFixed(2);
        }
        report.push({
          nombreCurso: cursoData.nombre,
          alumnosInscritos: cursoData.alumnosInscritos.length,
          promedioCalificaciones: promedio,
        });
      }
      setCourseReport(report);
      
      // 3. Generar nuevo reporte financiero
      const alumnosQuery = query(collection(db, 'users'), where('rol', '==', 'alumno'));
      const alumnosSnapshot = await getDocs(alumnosQuery);
      const financialData = alumnosSnapshot.docs.map(doc => ({
          nombre: doc.data().nombre,
          estado: doc.data().estadoFinanciero || 'No definido'
      }));
      setFinancialReport(financialData);

      setLoading(false);
    };

    generateReport();
  }, []);

  if (loading) return <div>Generando reporte...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver al Panel Principal
      </button>

      <div className="bg-white p-8 rounded-xl shadow-md space-y-12">
        <div className="flex items-center gap-4">
          <BarChart2 className="h-10 w-10 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
            {activeSemestre && <p className="text-gray-600">Mostrando datos para el semestre: {activeSemestre.nombre}</p>}
          </div>
        </div>

        {!activeSemestre ? (
          <p className="text-center text-gray-600 p-8 bg-gray-100 rounded-lg">No hay un semestre activo configurado.</p>
        ) : (
          <div className="space-y-8">
            {/* Tabla de Rendimiento de Cursos */}
            <div>
              <h2 className="text-xl font-bold mb-4">Rendimiento de Cursos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Inscritos</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Promedio Notas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseReport.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium">{row.nombreCurso}</td>
                        <td className="px-6 py-4 text-center">{row.alumnosInscritos}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600">{row.promedioCalificaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nueva Tabla de Estado Financiero */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign size={22}/> Estado Financiero de Alumnos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialReport.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium">{row.nombre}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.estado === 'Al día' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {row.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesAnaliticas;
