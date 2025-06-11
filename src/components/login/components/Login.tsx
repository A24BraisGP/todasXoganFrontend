import { useState } from 'react';
import axios from 'axios';
import Alert from './Alert';
import { z } from 'zod';

// Esquema de validación para registro
const registerSchema = z.object({
	nome: z
		.string()
		.min(1, { message: 'O nome é obrigatorio.' })
		.max(100, { message: 'O nome é demasiado longo.' }),
	email: z
		.string()
		.email({ message: 'Introduce un email válido.' })
		.max(250, { message: 'O email é demasiado longo.' }),
	password: z
		.string()
		.min(8, { message: 'A contrasinal debe de ter 8 caracteres.' })
		.max(50, { message: 'A contrasinal é demasiado longa.' }),
	imaxe_user: z.any().optional(),
	preferencias: z.array(z.string()).optional(),
});

interface Usuario {
	id: number;
	nome: string;
	email: string;
	imaxe_user: string | null;
	admin: boolean;
	favoritos: number[];
	preferencias: any[];
}

interface LoginProps {
	onLogin: (usuario: Usuario) => void;
}

const Login = ({ onLogin }: LoginProps) => {
	const [nome, setNome] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [imaxeUser, setImaxeUser] = useState<File | null>(null);
	const [preferencias, setPreferencias] = useState<string[]>([]);
	const [error, setError] = useState('');
	const [isRegister, setIsRegister] = useState(false);
	const [registerSuccess, setRegisterSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const loginResponse = await axios.post(
				'https://restapitodasxogan.onrender.com/api/usuarios/login/',
				{
					nome: nome,
					contrasinal: password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					withCredentials: true,
				}
			);

			if (loginResponse.data.usuario) {
				localStorage.setItem(
					'userId',
					loginResponse.data.usuario.id.toString()
				);

				onLogin(loginResponse.data.usuario);
			} else {
				console.error('Error de login - Datos:', loginResponse.data);
				setError(
					loginResponse.data.error || 'Error no inicio de sesión'
				);
			}
		} catch (err) {
			console.error('Error inicio de sesión:', err);
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.error || 'Error inicio de sesión');
			} else {
				setError('Error de conexión co servidor');
			}
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setRegisterSuccess(false);

		const result = registerSchema.safeParse({
			nome,
			email,
			password,
			imaxe_user: imaxeUser,
			preferencias,
		});
		if (!result.success) {
			setError(result.error.errors[0].message);
			return;
		}

		try {
			const checkUserResponse = await axios.get(
				`https://restapitodasxogan.onrender.com/api/usuarios/check-nome/${nome}/`,
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					withCredentials: true,
				}
			);

			if (checkUserResponse.data.exists) {
				setError('Este nome xa está en uso');
				return;
			}

			const formData = new FormData();
			formData.append('nome', nome);
			formData.append('email', email);
			formData.append('contrasinal', password);
			formData.append('username', nome);
			if (imaxeUser) formData.append('imaxe_user', imaxeUser);

			// Enviar preferencias como array vacío
			formData.append('preferencias', JSON.stringify([]));

			console.log('FormData antes de enviar:', {
				nome,
				email,
				contrasinal: password,
				username: nome,
				preferencias: [],
			});

			const response = await axios.post(
				'https://restapitodasxogan.onrender.com/api/usuarios/',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Accept: 'application/json',
					},
					withCredentials: true,
				}
			);

			console.log('Respuesta do servidor:', response.data);

			setRegisterSuccess(true);
			setEmail('');
			setPassword('');
			setNome('');
			setImaxeUser(null);
			setPreferencias([]);
		} catch (err) {
			console.error('Erro completo:', err);
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.detail || 'Erro ao crear usuario');
			} else {
				setError('Erro de rede');
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-100">
			<div className="card w-96 bg-base-200 shadow-xl">
				<div className="card-body">
					{isRegister ? (
						<>
							<h2 className="card-title text-2xl font-bold text-center mb-6">
								Crear conta
							</h2>
							<form
								onSubmit={handleRegister}
								encType="multipart/form-data"
							>
								<div className="form-control">
									<label className="label">
										<span className="label-text">Nome</span>
									</label>
									<input
										type="text"
										placeholder="Nome"
										className="input input-bordered"
										value={nome}
										onChange={(e) =>
											setNome(e.target.value)
										}
										required
									/>
								</div>
								<div className="form-control mt-4">
									<label className="label">
										<span className="label-text">
											Email
										</span>
									</label>
									<input
										type="email"
										placeholder="teu@email.com"
										className="input input-bordered"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										required
									/>
								</div>
								<div className="form-control mt-4">
									<label className="label">
										<span className="label-text">
											Contrasinal
										</span>
									</label>
									<input
										type="password"
										placeholder="••••••••"
										className="input input-bordered"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										required
									/>
								</div>
								<div className="form-control mt-4">
									<label className="label">
										<span className="label-text">
											Imaxe de usuario (opcional)
										</span>
									</label>
									<input
										type="file"
										accept="image/*"
										className="file-input file-input-bordered"
										onChange={(e) =>
											setImaxeUser(
												e.target.files
													? e.target.files[0]
													: null
											)
										}
									/>
								</div>

								{error && (
									<Alert onClose={() => setError('')}>
										{error}
									</Alert>
								)}
								{registerSuccess && (
									<div className="alert alert-success mt-4">
										<span>
											Usuario creado. Podes iniciar sesión
										</span>
									</div>
								)}
								<div className="form-control mt-6">
									<button
										type="submit"
										className="btn btn-primary"
									>
										Crear Conta
									</button>
								</div>
							</form>
							<button
								type="button"
								className="btn btn-link mt-4"
								onClick={() => {
									setIsRegister(false);
									setError('');
									setRegisterSuccess(false);
								}}
							>
								Volver ao login
							</button>
						</>
					) : (
						<>
							<h2 className="card-title text-2xl font-bold text-center mb-6">
								Iniciar Sesión
							</h2>
							<form onSubmit={handleSubmit}>
								<div className="form-control">
									<label className="label">
										<span className="label-text">
											Nome de usuario
										</span>
									</label>
									<input
										type="text"
										placeholder="Nome de usuario"
										className="input input-bordered"
										value={nome}
										onChange={(e) =>
											setNome(e.target.value)
										}
										required
									/>
								</div>
								<div className="form-control mt-4">
									<label className="label">
										<span className="label-text">
											Contrasinal
										</span>
									</label>
									<input
										type="password"
										placeholder="••••••••"
										className="input input-bordered"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										required
									/>
								</div>
								{error && (
									<Alert onClose={() => setError('')}>
										{error}
									</Alert>
								)}
								<div className="form-control mt-6">
									<button
										type="submit"
										className="btn btn-primary"
									>
										Iniciar Sesión
									</button>
								</div>
							</form>
							<button
								type="button"
								className="btn btn-link mt-4"
								onClick={() => {
									setIsRegister(true);
									setError('');
								}}
							>
								Crear conta
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Login;
