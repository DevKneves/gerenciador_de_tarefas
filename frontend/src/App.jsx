import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login'; // Corrigido para './components/login'
import Cadastro from './components/cadastro'; // Corrigido para './components/cadastro'
import GerenciadorTarefas from './components/Gerenciador'; // Corrigido para './components/gerenciador'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/gerenciador" element={<GerenciadorTarefas />} />
      </Routes>
    </Router>
  );
};

export default App;
