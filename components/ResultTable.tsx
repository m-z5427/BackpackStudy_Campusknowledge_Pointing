
import * as React from 'react';
import { UserResponse } from '../types.ts';

interface ResultTableProps {
  responses: UserResponse[];
  onRestart: () => void;
  participantId: string;
}

const ResultTable: React.FC<ResultTableProps> = ({ responses, onRestart, participantId }) => {
  const downloadCSV = () => {
    const headers = ['ParticipantID', 'TrialID', 'StartingLocation', 'FacingLocation', 'EndingLocation', 'CorrectAngle', 'UserAngle', 'Error'];
    const rows = responses.map(r => [
      `"${participantId}"`,
      r.trialId,
      `"${r.startingLocation}"`,
      `"${r.facingLocation}"`,
      `"${r.endingLocation}"`,
      r.correctAngle,
      r.userAngle.toFixed(2),
      r.error
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pointing_task_${participantId}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const averageError = responses.length > 0 
    ? responses.reduce((acc, curr) => acc + curr.error, 0) / responses.length 
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Task Complete</h1>
          <p className="text-gray-600 italic">Participant: <span className="text-indigo-600 font-bold">{participantId}</span></p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-3">
          <span className="text-sm text-indigo-700 font-medium uppercase tracking-wider">Average Error</span>
          <div className="text-3xl font-black text-indigo-900">{averageError.toFixed(2)}°</div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Starting Point</th>
                <th className="px-6 py-4">Facing landmark</th>
                <th className="px-6 py-4">Target landmark</th>
                <th className="px-6 py-4">Correct</th>
                <th className="px-6 py-4">Response</th>
                <th className="px-6 py-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {responses.map((r, idx) => (
                <tr key={`${r.trialId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400">{r.trialId}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.startingLocation}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{r.facingLocation}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600">{r.endingLocation}</td>
                  <td className="px-6 py-4 text-gray-600">{r.correctAngle}°</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{r.userAngle.toFixed(1)}°</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      r.error < 15 ? 'bg-green-100 text-green-700' : 
                      r.error < 45 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.error}°
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={downloadCSV}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          Download CSV
        </button>
        <button
          onClick={onRestart}
          className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-lg border border-gray-300 transition-all shadow-sm active:scale-95"
        >
          Clear Data & Start New
        </button>
      </div>
    </div>
  );
};

export default ResultTable;
