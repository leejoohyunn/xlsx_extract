import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ProgressReportFormatter = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);

    const processStudentData = (jsonData) => {
        console.log('처리할 데이터:', jsonData[0]);
        
        // 컬럼명 확인 ('현재진도' 또는 '현재진도 ' 둘 다 지원)
        const hasTrimmedColumn = jsonData[0].hasOwnProperty('현재진도');
        const hasSpacedColumn = jsonData[0].hasOwnProperty('현재진도 ');
        const progressColumn = hasTrimmedColumn ? '현재진도' : hasSpacedColumn ? '현재진도 ' : null;

        // 학생별로 데이터 그룹화
        const studentGroups = {};

        jsonData.forEach(row => {
            const studentName = row['학생명'];
            if (!studentName) return;

            if (!studentGroups[studentName]) {
                studentGroups[studentName] = {
                    진도: [],
                    단원테스트: [],
                    개념테스트: []
                };
            }

            // 진도 데이터 처리
            if (progressColumn && row[progressColumn] && row[progressColumn].toString().trim()) {
                studentGroups[studentName].진도.push(row[progressColumn].toString().trim());
            }

            // 테스트 결과 처리
            if (row['단원테스트'] && row['단원테스트'].toString().trim()) {
                // 출결이 '결'인 경우에만 포함
                if (!row['출결'] || row['출결'] === '결') {
                    const score = row['H'] ? ` ${row['H']}` : '';
                    studentGroups[studentName].단원테스트.push(row['단원테스트'].toString().trim() + score);
                }
            }

            if (row['개념테스트'] && row['개념테스트'].toString().trim()) {
                studentGroups[studentName].개념테스트.push(row['개념테스트'].toString().trim());
            }
        });

        console.log('처리된 데이터:', studentGroups);

        return Object.entries(studentGroups).map(([name, data]) => {
            const report = `안녕하세요.
백전백승 수학학원입니다.
12월 4주차 ${name}

1) 진도: 
${data.진도[data.진도.length - 1] || ''}

${data.단원테스트.length > 0 || data.개념테스트.length > 0 ? '2) 테스트\n' : ''}${data.단원테스트.length > 0 ? `단원테스트:\n${data.단원테스트.join('\n')}\n` : ''}${data.개념테스트.length > 0 ? `개념테스트:\n${data.개념테스트.join('\n')}\n` : ''}
따뜻한 주말 되십시오^^`;

            return { name, report };
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {
                cellDates: true,
                cellStyles: true
            });

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
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

    const handleCopy = async (report) => {
        try {
            await navigator.clipboard.writeText(report);
            alert('복사되었습니다!');
        } catch (err) {
            console.error('복사 실패:', err);
            // 폴백: 구형 브라우저 지원
            const textArea = document.createElement('textarea');
            textArea.value = report;
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
                            onClick={() => handleCopy(report.report)}
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
