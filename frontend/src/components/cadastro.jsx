import React, { useState } from 'react';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifique se todos os campos estão preenchidos
    if (!nome || !email || !senha) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    const newUser = { nome, email, senha };

    fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Mensagem do servidor após o cadastro
          window.location.href = '/'; // Redireciona para a página de login
        } else {
          setErrorMessage('Erro ao tentar cadastrar.');
        }
      })
      .catch((error) => {
        console.error('Erro no cadastro:', error);
        setErrorMessage('Erro ao tentar cadastrar');
      });
  };

  return (
    <div className="register-container">
      <h1>Cadastrar Usuário</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome:</label>
        <input
          type="text"
          id="nome"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Cadastrar</button>
      </form>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <p>
          Já tem uma conta? <a href="/">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;
