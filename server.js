const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelos de Usuário e Tarefa
const userSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, unique: true },
    senha: String,
    dataCriacao: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    titulo: String,
    descricao: String,
    data: Date,
    status: { type: String, default: "pendente" },
    dataCriacao: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

// Modelo para a coleção de tarefas finalizadas
const finishedTaskSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    titulo: String,
    descricao: String,
    data: Date,
    status: String,
    dataCriacao: Date,
    dataFinalizacao: { type: Date, default: Date.now }
});

const FinishedTask = mongoose.model('FinishedTask', finishedTaskSchema);

// Middleware para verificar se o usuário está autenticado
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Token não fornecido ou inválido' });
    }

    const token = authHeader.split(' ')[1]; // Extrair o token após "Bearer"

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.userId = decoded.userId; // Armazena o userId do token no request
        next();
    });
};

// Middleware
app.use(express.json());
app.use(cors());

// Rota para registrar um novo usuário (Cadastro)
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    // Verificar se o usuário já existe
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: 'Usuário já existe' });

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = new User({ nome, email, senha: hashedPassword });

    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Rota para fazer login do usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    // Encontrar o usuário no banco de dados
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    // Comparar a senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ message: 'Senha inválida' });

    // Gerar um JWT
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });

    res.json({ token });
});

// Rota para obter as tarefas de um usuário
app.get('/tasks', verifyToken, async (req, res) => {
    const usuarioId = req.userId;  // Usa o userId verificado no token
    try {
        const tasks = await Task.find({ usuarioId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao recuperar tarefas' });
    }
});

// Rota para criar uma nova tarefa
app.post('/tasks', verifyToken, async (req, res) => {
    const { titulo, descricao, data } = req.body;
    const usuarioId = req.userId;

    if (!titulo) {
        return res.status(400).json({ message: 'Título é obrigatório' });
    }

    try {
        const newTask = new Task({ usuarioId, titulo, descricao, data });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar tarefa' });
    }
});

// Rota para atualizar o status de uma tarefa
app.put('/tasks/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar a tarefa' });
    }
});

// Rota para remover uma tarefa
app.delete('/tasks/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Encontrar a tarefa antes de excluí-la
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }

        // Mover a tarefa para a coleção "finalizadas"
        const finishedTask = new FinishedTask({
            usuarioId: task.usuarioId,
            titulo: task.titulo,
            descricao: task.descricao,
            data: task.data,
            status: task.status,
            dataCriacao: task.dataCriacao
        });
        await finishedTask.save();

        // Excluir a tarefa da coleção original
        await Task.findByIdAndDelete(id);

        res.json({ message: 'Tarefa movida para finalizadas com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao mover tarefa para finalizadas' });
    }
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
