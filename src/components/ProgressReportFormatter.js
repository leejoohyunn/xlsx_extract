import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ProgressReportFormatter = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);

    const processStudentData = (jsonData) => {
        // 데이터 처리 전 콘솔에 출력하여 확인
        console.log('처리할 데이터:', jsonData[0]);

        // 학생별로 데이터 그룹화
        const studentGroups = {};

        jsonData.forEach(row => {
            const studentName = row['학생명'];
            if (!studentName) return;

            if (!studentGroups[studentName]) {
                studentGroups[studentName] = {
                    현재진도: [],
                    단원테스트: [],
                    개념테스트: []
                };
            }

            // 공백이 포함된 컬럼명 처리
            if (row['현재진도 '] && row['현재진도 '].toString().trim()) {
                studentGroups[studentName].현재진도.push(row['현재진도 '].trim());
            }
            if (row['단원테스트'] && row['단원테스트'].toString().trim()) {
                studentGroups[studentName].단원테스트.push(row['단원테스트'].trim());
            }
            if (row['개념테스트'] && row['개념테스트'].toString().trim()) {
                studentGroups[studentName].개념테스트.push(row['개념테스트'].trim());
            }
        });

        // 결과 확인을 위한 로그
        console.log('처리된 데이터:', studentGroups);

        return Object.entries(studentGroups).map(([name, data]) => {
            const report = `안녕하세요.
백전백승 수학학원입니다.

12월 4주차 ${name}
1) 진도: 
${data.현재진도[data.현재진도.length - 1] || ''}
${data.단원테스트.length > 0 || data.개념테스트.length > 0 ? 
  '
2) 테스트' : ''}${data.단원테스트.length > 0 ? `
단원테스트:
${data.단원테스트.join('\n')}` : ''}${data.개념테스트.length > 0 ? `
개념테스트:
${data.개념테스트.join('\n')}` : ''}

따뜻한 주말 되십시오^^`;

            return { name, report };
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // 엑셀 데이터를 JSON으로 변환
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                raw: false,
                defval: ''
            });

            const processedReports = processStudentData(jsonData);
            setReports(processedReports);
            setError(null);
        } catch (err) {
            setError('파일 처리 중 오류가 발생했습니다: ' + err.message);
            console.error('Error details:', err);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mb-4 p-2 border rounded"
                />
            </div>
            
            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report, index) => (
                    <div key={index} className="p-4 border rounded bg-white shadow">
                        <h3 className="font-bold mb-2">{report.name}</h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                            {report.report}
                        </pre>
                        <button
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(report.report);
                                    alert('복사되었습니다!');
                                } catch (err) {
                                    console.error('복사 실패:', err);
                                    const textArea = document.createElement('textarea');
                                    textArea.value = report.report;
                                    document.body.appendChild(textArea);
                                    textArea.select();
                                    try {
                                        document.execCommand('copy');
                                        alert('복사되었습니다!');
                                    } catch (err) {
                                        alert('복사에 실패했습니다. 직접 텍스트를 선택해서 복사해주세요.');
                                    }
                                    document.body.removeChild(textArea);
                                }
                            }}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            복사하기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressReportFormatter;
