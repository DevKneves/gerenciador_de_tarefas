import React, { useState, useEffect } from 'react';
import './Gerenciador.css'; // Corrigido para './Gerenciador.css'

const GerenciadorTarefas = () => {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para acessar o gerenciador de tarefas.');
      localStorage.removeItem('usuarioId');
      window.location.href = 'login.html';
    } else {
      loadTasks();
    }
  }, []);

  const loadTasks = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar tarefas');
        }
        return response.json();
      })
      .then(tasks => setTasks(tasks))
      .catch(error => {
        console.error('Erro ao carregar tarefas:', error);
        setErrorMessage('Erro ao carregar tarefas');
      });
  };

  const addTask = (e) => {
    e.preventDefault();

    if (!taskInput.trim()) {
      alert('Por favor, insira uma tarefa.');
      return;
    }

    const newTask = {
      titulo: taskInput.trim(),
      descricao: '',
      data: new Date(),
    };

    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'Erro ao adicionar tarefa');
          });
        }
        return response.json();
      })
      .then(task => {
        setTasks(prevTasks => [...prevTasks, task]);
        setTaskInput('');
      })
      .catch(error => {
        console.error('Erro ao adicionar tarefa:', error);
        alert('Erro ao adicionar tarefa: ' + error.message);
      });
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task._id === taskId) {
        task.status = task.status === 'pendente' ? 'finalizada' : 'pendente';
      }
      return task;
    });
    setTasks(updatedTasks);

    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: updatedTasks.find(task => task._id === taskId).status }),
    })
      .then(response => response.json())
      .then(updatedTask => console.log('Status atualizado:', updatedTask))
      .catch(error => console.error('Erro ao atualizar status da tarefa:', error));
  };

  const removeTask = (taskId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao remover tarefa');
        }
        return response.json();
      })
      .then(() => {
        setTasks(tasks.filter(task => task._id !== taskId));
        alert('Tarefa removida com sucesso');
      })
      .catch(error => {
        console.error('Erro ao remover tarefa:', error);
        alert('Erro ao remover tarefa');
      });
  };

  return (
    <div className="task-manager">
      <h1>Gerenciador de Tarefas</h1>
      <div className="task-input">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Adicione uma tarefa"
        />
        <button onClick={addTask}>Adicionar</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id} className={task.status === 'finalizada' ? 'completed' : ''}>
            <span
              className={`marker ${task.status === 'finalizada' ? 'completed' : ''}`}
              onClick={() => toggleTask(task._id)}
            ></span>
            {task.titulo}
            <button onClick={() => removeTask(task._id)}>Remover</button>
            <div className="timestamps">
              Adicionado: {new Date(task.dataCriacao).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default GerenciadorTarefas;
