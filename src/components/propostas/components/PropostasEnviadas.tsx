import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '../../login/components/Alert';
import PropostaCard from './PropostaCard';

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

interface Accesibilidade {
	id: number;
	nome_accesibilidade: string;
}

const PropostasEnviadas = () => {
	const [propostas, setPropostas] = useState<Proposta[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [usuarios, setUsuarios] = useState<{ [key: number]: string }>({});
	const [accesibilidades, setAccesibilidades] = useState<Accesibilidade[]>(
		[]
	);

	useEffect(() => {
		cargarPropostas();
		cargarAccesibilidades();
	}, []);

	const cargarAccesibilidades = async () => {
		try {
			const response = await axios.get<Accesibilidade[]>(
				'https://restapitodasxogan.onrender.com/api/accesibilidades/',
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					withCredentials: true,
				}
			);
			setAccesibilidades(response.data);
		} catch (err) {
			console.error('Error ao cargar accesibilidades:', err);
		}
	};

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

			if (proposta.caratula) {
				try {
					const response = await fetch(proposta.caratula);
					const blob = await response.blob();
					formData.append('caratula', blob, 'caratula.jpg');
				} catch (error) {
					console.error('Error al obtener la carátula:', error);
				}
			}

			// Crear o xogo
			const xogoResponse = await axios.post(
				'https://restapitodasxogan.onrender.com/api/videoxogos/',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
					withCredentials: true,
				}
			);

			if (xogoResponse.status === 200 || xogoResponse.status === 201) {
				console.log(
					'Actualizando estado de la propuesta a APROBADA...'
				);

				try {
					const response = await axios.patch(
						`https://restapitodasxogan.onrender.com/api/propostas/${proposta.id}/revision/`,
						{ estado: 'APROBADA' },
						{
							headers: {
								'Content-Type': 'application/json',
								Accept: 'application/json',
								Authorization: `Bearer ${localStorage.getItem(
									'token'
								)}`,
							},
							withCredentials: true,
						}
					);

					console.log('Respuesta del servidor:', response.data);

					if (response.status === 200) {
						// Eliminar la propuesta de la lista (solo visualmente)
						setPropostas(
							propostas.filter((p) => p.id !== proposta.id)
						);
					} else {
						setError('Erro ao actualizar o estado da proposta');
					}
				} catch (updateError) {
					console.error(
						'Error al actualizar el estado:',
						updateError
					);
					if (axios.isAxiosError(updateError)) {
						console.error('Datos del error:', {
							status: updateError.response?.status,
							data: updateError.response?.data,
							headers: updateError.response?.headers,
						});
					}
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

			const response = await axios.patch(
				`https://restapitodasxogan.onrender.com/api/propostas/${propostaId}/revision/`,
				{ estado: 'REXEITADA' },
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
					withCredentials: true,
				}
			);

			console.log('Respuesta del servidor:', response.data);

			if (response.status === 200) {
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
				<span
					className="loading loading-spinner loading-lg"
					role="status"
					aria-label="Cargando propostas"
				></span>
			</div>
		);
	}

	if (error) {
		return <Alert onClose={() => setError(null)}>{error}</Alert>;
	}

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-6">Propostas Enviadas</h2>

			{/* Propostas Pendentes */}
			<div className="mb-8">
				<h3 className="text-xl font-semibold mb-4 text-primary">
					Propostas Pendentes
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{propostas
						.filter((proposta) => proposta.estado === 'PENDENTE')
						.map((proposta) => (
							<PropostaCard
								key={proposta.id}
								proposta={proposta}
								onAceptar={handleAceptar}
								onRechazar={handleRechazar}
								showActions={true}
								userName={usuarios[proposta.usuario_id]}
								accesibilidades={accesibilidades}
							/>
						))}
				</div>
				{propostas.filter((p) => p.estado === 'PENDENTE').length ===
					0 && (
					<div className="text-center mt-4">
						<p className="text-lg text-gray-500">
							Non hai propostas pendentes
						</p>
					</div>
				)}
			</div>

			{/* Propostas Aprobadas */}
			<div className="mb-8">
				<h3 className="text-xl font-semibold mb-4 text-success">
					Propostas Aprobadas
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{propostas
						.filter((proposta) => proposta.estado === 'APROBADA')
						.map((proposta) => (
							<PropostaCard
								key={proposta.id}
								proposta={proposta}
								showActions={false}
								userName={usuarios[proposta.usuario_id]}
								accesibilidades={accesibilidades}
							/>
						))}
				</div>
				{propostas.filter((p) => p.estado === 'APROBADA').length ===
					0 && (
					<div className="text-center mt-4">
						<p className="text-lg text-gray-500">
							Non hai propostas aprobadas
						</p>
					</div>
				)}
			</div>

			{/* Propostas Rechazadas */}
			<div className="mb-8">
				<h3 className="text-xl font-semibold mb-4 text-error">
					Propostas Rechazadas
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{propostas
						.filter((proposta) => proposta.estado === 'REXEITADA')
						.map((proposta) => (
							<PropostaCard
								key={proposta.id}
								proposta={proposta}
								showActions={false}
								userName={usuarios[proposta.usuario_id]}
								accesibilidades={accesibilidades}
							/>
						))}
				</div>
				{propostas.filter((p) => p.estado === 'REXEITADA').length ===
					0 && (
					<div className="text-center mt-4">
						<p className="text-lg text-gray-500">
							Non hai propostas rechazadas
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default PropostasEnviadas;
