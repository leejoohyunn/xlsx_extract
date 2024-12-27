import React from 'react';
import ProgressReportFormatter from './components/ProgressReportFormatter';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-2xl font-bold mb-4">학생 진도 보고서 생성기</h1>
      </header>
      <main>
        <ProgressReportFormatter />
      </main>
    </div>
  );
}

export default App;
