import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from './login/components/Alert';

interface Proposta {
	id: number;
	titulo: string;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: number[];
	plataforma: number[];
	caratula: string;
	accesibilidades: number[];
	usuario_id: number;
	estado: 'PENDENTE' | 'APROBADA' | 'REXEITADA';
	desarrolladora: string;
}

interface Usuario {
	id: number;
	favoritos: number[];
	preferencias: [];
	nome: string;
	email: string;
	imaxe_user: string | null;
	admin: boolean;
}

const PropostasEnviadas = () => {
	const [propostas, setPropostas] = useState<Proposta[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [usuarios, setUsuarios] = useState<{ [key: number]: string }>({});

	useEffect(() => {
		cargarPropostas();
	}, []);

	const cargarPropostas = async () => {
		try {
			const response = await axios.get<Proposta[]>(
				'https://restapitodasxogan.onrender.com/api/propostas/',
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					withCredentials: true,
				}
			);
			setPropostas(response.data);

			// Obtener los nombres de usuario para cada propuesta
			const userIds = [
				...new Set(response.data.map((p) => p.usuario_id)),
			];
			const usuariosTemp: { [key: number]: string } = {};

			for (const id of userIds) {
				try {
					const userResponse = await axios.get<Usuario>(
						`https://restapitodasxogan.onrender.com/api/usuarios/${id}/`,
						{
							headers: {
								'Content-Type': 'application/json',
								Accept: 'application/json',
							},
							withCredentials: true,
						}
					);
					usuariosTemp[id] = userResponse.data.nome;
				} catch (err) {
					usuariosTemp[id] = 'Usuario desconocido';
				}
			}

			setUsuarios(usuariosTemp);
			setLoading(false);
		} catch (err) {
			setError('Erro ao cargar as propostas');
			setLoading(false);
		}
	};

	const handleAceptar = async (proposta: Proposta) => {
		try {
			// Crear FormData para el nuevo juego
			const formData = new FormData();

			// Añadir campos básicos
			formData.append('titulo', proposta.titulo);
			formData.append('descricion', proposta.descricion);
			formData.append('prezo', proposta.prezo.toString());
			formData.append(
				'idade_recomendada',
				proposta.idade_recomendada.toString()
			);
			formData.append('desarrolladora', proposta.desarrolladora);

			// Añadir campos many-to-many como números individuales
			proposta.xenero.forEach((id) => {
				formData.append('xenero', id.toString());
			});
			proposta.plataforma.forEach((id) => {
				formData.append('plataforma', id.toString());
			});
			proposta.accesibilidades.forEach((id) => {
				formData.append('accesibilidades', id.toString());
			});

			// Obtener y añadir la carátula como archivo
			if (proposta.caratula) {
				try {
					const response = await fetch(proposta.caratula);
					const blob = await response.blob();
					formData.append('caratula', blob, 'caratula.jpg');
				} catch (error) {
					console.error('Error al obtener la carátula:', error);
				}
			}

			// Crear el nuevo juego
			const xogoResponse = await axios.post(
				'https://restapitodasxogan.onrender.com/api/videoxogos/',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Token ${localStorage.getItem('token')}`,
					},
					withCredentials: true,
				}
			);

			if (xogoResponse.status === 200) {
				console.log(
					'Actualizando estado de la propuesta a APROBADA...'
				);
				const updateData = { estado: 'APROBADA' };
				console.log('Datos a enviar:', updateData);

				const response = await axios.patch(
					`https://restapitodasxogan.onrender.com/api/propostas/${proposta.id}/`,
					updateData,
					{
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: `Token ${localStorage.getItem(
								'token'
							)}`,
						},
						withCredentials: true,
					}
				);

				console.log('Respuesta del servidor:', response.data);

				if (response.status === 200) {
					// Eliminar la propuesta de la lista (solo visualmente)
					setPropostas(propostas.filter((p) => p.id !== proposta.id));
				} else {
					setError('Erro ao actualizar o estado da proposta');
				}
			} else {
				setError('Erro ao crear o xogo');
			}
		} catch (err) {
			console.error('Error aceptar propuesta:', err);
			if (axios.isAxiosError(err)) {
				console.error('Datos del error:', {
					status: err.response?.status,
					data: err.response?.data,
					headers: err.response?.headers,
				});
			}
			setError('Erro ao aceptar a proposta');
		}
	};

	const handleRechazar = async (propostaId: number) => {
		try {
			console.log('Actualizando estado de la propuesta a REXEITADA...');
			const updateData = { estado: 'REXEITADA' };
			console.log('Datos a enviar:', updateData);

			const response = await axios.patch(
				`https://restapitodasxogan.onrender.com/api/propostas/${propostaId}/`,
				updateData,
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						Authorization: `Token ${localStorage.getItem('token')}`,
					},
					withCredentials: true,
				}
			);

			console.log('Respuesta del servidor:', response.data);

			if (response.status === 200) {
				// Eliminar la propuesta de la lista (solo visualmente)
				setPropostas(propostas.filter((p) => p.id !== propostaId));
			} else {
				setError('Erro ao actualizar o estado da proposta');
			}
		} catch (err) {
			console.error('Erro rexeitar propuesta:', err);
			if (axios.isAxiosError(err)) {
				console.error('Datos del error:', {
					status: err.response?.status,
					data: err.response?.data,
					headers: err.response?.headers,
				});
			}
			setError('Erro ao rexeitar a proposta');
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (error) {
		return <Alert onClose={() => setError(null)}>{error}</Alert>;
	}

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-6">Propostas Enviadas</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{propostas
					.filter((proposta) => proposta.estado === 'PENDENTE')
					.map((proposta) => (
						<div
							key={proposta.id}
							className="card bg-base-100 shadow-xl"
						>
							<figure>
								<img
									src={proposta.caratula}
									alt={proposta.titulo}
									className="w-full h-48 object-cover"
								/>
							</figure>
							<div className="card-body">
								<h2 className="card-title">
									{proposta.titulo}
								</h2>
								<p className="line-clamp-3">
									{proposta.descricion}
								</p>
								<div className="flex flex-wrap gap-2 mt-2">
									<div className="badge badge-primary">
										{proposta.idade_recomendada}+
									</div>
									<div className="badge badge-secondary">
										{proposta.prezo}€
									</div>
									<div className="badge badge-accent">
										Enviado por:{' '}
										{usuarios[proposta.usuario_id] ||
											'Cargando...'}
									</div>
									<div
										className={`badge ${
											proposta.estado === 'APROBADA'
												? 'badge-success'
												: proposta.estado ===
												  'REXEITADA'
												? 'badge-error'
												: 'badge-warning'
										}`}
									>
										{proposta.estado}
									</div>
								</div>
								{proposta.estado === 'PENDENTE' && (
									<div className="card-actions justify-end mt-4">
										<button
											className="btn btn-success btn-sm"
											onClick={() =>
												handleAceptar(proposta)
											}
										>
											Aceptar
										</button>
										<button
											className="btn btn-error btn-sm"
											onClick={() =>
												handleRechazar(proposta.id)
											}
										>
											Rexeitar
										</button>
									</div>
								)}
							</div>
						</div>
					))}
			</div>
			{propostas.filter((p) => p.estado === 'PENDENTE').length === 0 && (
				<div className="text-center mt-8">
					<p className="text-lg">Non hai propostas pendentes</p>
				</div>
			)}
		</div>
	);
};

export default PropostasEnviadas;
