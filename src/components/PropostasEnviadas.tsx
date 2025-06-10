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

// Constantes para los estados de las propuestas
const ESTADO_PROPOSITA = {
	PENDENTE: 'PENDENTE',
	APROBADA: 'APROBADA',
	REXEITADA: 'REXEITADA',
} as const;

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
				'http://localhost:8000/api/propostas/'
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
						`http://localhost:8000/api/usuarios/${id}/`
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
			// Crear nuevo juego con los datos de la propuesta
			const juegoData = {
				titulo: proposta.titulo,
				descricion: proposta.descricion,
				prezo: proposta.prezo,
				idade_recomendada: proposta.idade_recomendada,
				desarrolladora: proposta.desarrolladora,
				xenero: proposta.xenero,
				plataforma: proposta.plataforma,
				caratula: proposta.caratula,
				accesibilidades: proposta.accesibilidades,
			};

			console.log('Datos a crear:', juegoData);

			await axios.post(
				'http://localhost:8000/api/videoxogos/',
				juegoData,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			// Actualizar el estado de la propuesta a APROBADA
			const response = await axios.patch(
				`http://localhost:8000/api/propostas/${proposta.id}/`,
				{ estado: ESTADO_PROPOSITA.APROBADA },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 200) {
				setPropostas(
					propostas.map((p) =>
						p.id === proposta.id
							? { ...p, estado: ESTADO_PROPOSITA.APROBADA }
							: p
					)
				);
			} else {
				setError('Erro ao actualizar o estado da proposta');
			}
		} catch (err) {
			console.error('Error aceptar propuesta:', err);
			setError('Erro ao aceptar a proposta');
		}
	};

	const handleRechazar = async (propostaId: number) => {
		try {
			const response = await axios.patch(
				`http://localhost:8000/api/propostas/${propostaId}/`,
				{ estado: ESTADO_PROPOSITA.REXEITADA },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 200) {
				setPropostas(
					propostas.map((p) =>
						p.id === propostaId
							? { ...p, estado: ESTADO_PROPOSITA.REXEITADA }
							: p
					)
				);
			} else {
				setError('Erro ao actualizar o estado da proposta');
			}
		} catch (err) {
			console.error('Erro rexeitar propuesta:', err);
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
				{propostas.map((proposta) => (
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
							<h2 className="card-title">{proposta.titulo}</h2>
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
										proposta.estado ===
										ESTADO_PROPOSITA.APROBADA
											? 'badge-success'
											: proposta.estado ===
											  ESTADO_PROPOSITA.REXEITADA
											? 'badge-error'
											: 'badge-warning'
									}`}
								>
									{proposta.estado}
								</div>
							</div>
							{proposta.estado === ESTADO_PROPOSITA.PENDENTE && (
								<div className="card-actions justify-end mt-4">
									<button
										className="btn btn-success btn-sm"
										onClick={() => handleAceptar(proposta)}
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
			{propostas.length === 0 && (
				<div className="text-center mt-8">
					<p className="text-lg">Non hai propostas pendentes</p>
				</div>
			)}
		</div>
	);
};

export default PropostasEnviadas;
