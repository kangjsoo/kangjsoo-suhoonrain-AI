import React, { useState, useEffect } from 'react';
import { ConsultationRecord } from '../types';
import { databaseService } from '../services/databaseService';
import ResultCard from './ResultCard';
import { Trash2, Search, ChevronDown, ChevronUp, Calendar, User, AlertCircle, History, ArrowLeft, Inbox } from 'lucide-react';

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const data = databaseService.getAllRecords();
    // Sort by newest first
    setRecords(data.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말 이 상담 내역을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      databaseService.deleteRecord(id);
      loadRecords();
      if (expandedId === id) setExpandedId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.formData.symptoms.toLowerCase().includes(searchLower) ||
      record.formData.issueType.toLowerCase().includes(searchLower) ||
      record.formData.role.toLowerCase().includes(searchLower) ||
      (record.result.coreIssue && record.result.coreIssue.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center">
            <button
            onClick={onBack}
            className="md:hidden mr-3 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
                <Inbox className="w-6 h-6 mr-2 text-blue-600" />
                상담 기록 보관함
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                기기에 저장된 지난 상담 내역을 확인하고 관리할 수 있습니다.
                </p>
            </div>
        </div>
        
        <button
          onClick={onBack}
          className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          상담 화면으로 돌아가기
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
          placeholder="증상, 유형, 핵심 쟁점 등으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
              <History className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">저장된 상담 기록이 없습니다</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
              상담을 진행하면 자동으로 기기에 내역이 저장되어 나중에 다시 확인할 수 있습니다.
            </p>
            <button 
                onClick={onBack}
                className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
                첫 상담 시작하기
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-slate-500">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
           </div>
        ) : (
          filteredRecords.map((record) => (
            <div 
              key={record.id} 
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                expandedId === record.id ? 'border-blue-300 shadow-lg ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div 
                className="p-4 md:p-5 cursor-pointer"
                onClick={() => toggleExpand(record.id)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs md:text-sm text-slate-500">
                      <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium border border-slate-200">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {formatDate(record.timestamp)}
                      </span>
                      <span className="flex items-center bg-blue-50 px-2.5 py-1 rounded-full text-blue-700 font-medium border border-blue-100">
                        <User className="w-3 h-3 mr-1.5" />
                        {record.formData.role}
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium border border-slate-200 truncate max-w-[150px]">
                        {record.formData.issueType}
                      </span>
                    </div>
                    
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1.5 break-keep leading-snug">
                      {record.result.coreIssue || "제목 없음"}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {record.formData.symptoms}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 pl-2">
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="기록 삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {expandedId === record.id ? (
                      <ChevronUp className="w-5 h-5 text-blue-500 mt-auto" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 mt-auto" />
                    )}
                  </div>
                </div>
              </div>

              {expandedId === record.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6 animate-fade-in">
                  <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center border-b pb-2">
                      <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                      당시 상담 신청 내용
                    </h4>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-4">
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit h-fit">증상</span> 
                          <span className="leading-relaxed">{record.formData.symptoms}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-4">
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit h-fit">이력</span> 
                          <span className="leading-relaxed">{record.formData.history}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-4">
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit h-fit">상대방 정보</span> 
                          <span className="leading-relaxed">{record.formData.otherPartyInfo || "-"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ResultCard result={record.result} />
                  
                  <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => toggleExpand(record.id)}
                        className="flex items-center text-slate-500 hover:text-slate-800 font-medium py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        상세 내용 접기
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;