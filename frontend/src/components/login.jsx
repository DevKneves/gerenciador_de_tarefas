import { useState } from "react";
import { Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro no login:', errorData.message); // Log para depuração
                setErrorMessage(errorData.message || "Erro ao fazer login");
                return;
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                const decoded = JSON.parse(atob(data.token.split(".")[1]));
                localStorage.setItem("usuarioId", decoded.userId);
                alert("Login bem-sucedido!");
                window.location.href = "/gerenciador";
            } else {
                setErrorMessage("Erro ao fazer login");
            }
        } catch (error) {
            console.error("Erro no login:", error); // Log para depuração
            setErrorMessage("Erro ao tentar fazer login");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
                <h1 className="text-xl mb-4">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label htmlFor="email" className="text-left text-sm">Email:</label>
                    <input
                        type="email"
                        id="email"
                        className="p-2 mb-3 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="senha" className="text-left text-sm">Senha:</label>
                    <input
                        type="password"
                        id="senha"
                        className="p-2 mb-3 border rounded"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Login</button>
                </form>
                <Link to="/cadastro">Não tem uma conta? Cadastre-se</Link>
                {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Login;