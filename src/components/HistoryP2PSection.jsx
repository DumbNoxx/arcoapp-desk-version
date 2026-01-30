import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Clock, Calendar } from 'lucide-react';
import ExcelJS from 'exceljs';

const HistoryP2PSection = ({ data, loading, onCopy }) => {
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
        const itemTime = new Date(item.date).getTime();
        const start = filterStart ? new Date(filterStart).getTime() : 0;
        const end = filterEnd ? new Date(filterEnd).getTime() : Infinity;
        return itemTime >= start && itemTime <= end;
    });
  }, [data, filterStart, filterEnd]);

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateString) => {
      const date = new Date(dateString);
      return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
  };

  const handleCopyDate = (dateStr) => {
    navigator.clipboard.writeText(dateStr);
    if (onCopy) onCopy("Fecha copiada");
  };

  const handleCopyRate = (value) => {
    const formatted = formatCurrency(value);
    navigator.clipboard.writeText(formatted);
    if (onCopy) onCopy(`Tasa copiada`);
  };

  const exportToCSV = () => {
    if (!filteredData || !filteredData.length) return;

    const headers = ['Fecha', 'Hora', 'Tasa (Bs)'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => {
          const { date, time } = formatDate(item.date);
          return `${date},${time},${item.value}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `[ARCOAPP]historial_p2p_48h.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = async () => {
    if (!filteredData || !filteredData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial P2P');

    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Hora', key: 'time', width: 10 },
      { header: 'Tasa (Bs)', key: 'value', width: 15 }
    ];

    filteredData.forEach(item => {
        const { date, time } = formatDate(item.date);
        worksheet.addRow({ date, time, value: item.value });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `[ARCOAPP]historial_p2p_48h.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-100 no-drag">
      <div className="flex flex-col gap-2 mb-4 px-2 no-drag">
        {/* Header / Info */}
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Últimas 48 Horas</span>
            </div>

             {filteredData && filteredData.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                    title="Exportar a CSV"
                  >
                    <Download size={14} className="text-gray-400 group-hover:text-white" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer group"
                    title="Exportar a Excel"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-500/80 group-hover:text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-500/80 group-hover:text-emerald-400 uppercase tracking-widest">Excel</span>
                  </button>
                </div>
              )}
         </div>

         {/* Filter Inputs */}
         <div className="flex items-center gap-2">
            <div className="relative flex-1 no-drag">
                <input
                    type="datetime-local"
                    value={filterStart}
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="md:w-full bg-[#111111] w-34  border border-yellow-500 rounded-xl py-1.5 px-2 text-[10px] md:text-[12px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag text-gray-300"
                    title="Inicio del rango"
                />
            </div>
            <span className="text-gray-600 text-[10px] font-bold">AL</span>
            <div className="relative flex-1 no-drag">
                <input
                    type="datetime-local"
                    value={filterEnd}
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="md:w-full bg-[#111111] w-34 border border-yellow-500 rounded-xl py-1.5 px-2 text-[10px] md:text-[12px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag text-gray-300"
                    title="Fin del rango"
                />
            </div>
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 no-drag px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Cargando historial...</p>
          </div>
        ) : filteredData && filteredData.length > 0 ? (
          <div className="space-y-2 pb-4">
            {filteredData.map((item, idx) => {
                 const { date, time } = formatDate(item.date);
                 return (
                    <motion.div
                        key={idx} // Using index as fallback if no id
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="bg-[#111111] border border-white/5 p-3 rounded-xl flex items-center justify-between transition-all no-drag hover:bg-[#161616]"
                    >
                        <div 
                        onClick={(e) => { e.stopPropagation(); handleCopyDate(item.date); }}
                        className="flex flex-col cursor-pointer hover:bg-white/5 px-2 -ml-2 py-1 rounded-lg transition-colors group"
                        >
                        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-0.5 group-hover:text-indigo-400 transition-colors">Fecha</span>
                        <div className="flex items-baseline gap-2">
                             <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{date}</span>
                             <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-300 transition-colors">{time}</span>
                        </div>
                       
                        </div>

                        <div 
                            onClick={(e) => { e.stopPropagation(); handleCopyRate(item.value); }}
                            className="flex flex-col items-end cursor-pointer hover:bg-green-500/10 px-2 py-1 rounded-lg transition-colors group"
                        >
                            <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold group-hover:text-green-400 transition-colors">USDT</span>
                            <span className="text-xs font-bold text-white font-mono group-hover:text-green-300 transition-colors">{formatCurrency(item.value)}</span>
                        </div>
                    </motion.div>
                );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <p className="text-xs">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryP2PSection;
