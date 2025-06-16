import { useEffect, useState } from 'react';
import axios from 'axios';
import Comentario from './Comentario';

interface XogoDetalleProps {
	xogoId: number;
	onVolver: () => void;
	userId: number;
}

interface Plataforma {
	id: number;
	plataforma: string;
}

interface Accesibilidade {
	id: number;
	nome_accesibilidade: string;
	descricion: string;
}

interface Comentario {
	id: number;
	comentario: string;
	usuario: number;
	videoxogo: number;
}

interface Xogo {
	id: number;
	titulo: string;
	accesibilidades: Array<number>;
	plataforma: Array<number>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	desarrolladora: string;
	caratula: string;
}

const XogoDetalle = ({ xogoId, onVolver, userId }: XogoDetalleProps) => {
	const [xogo, setXogo] = useState<Xogo | null>(null);
	const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
	const [comentarios, setComentarios] = useState<Comentario[]>([]);
	const [accesibilidades, setAccesibilidades] = useState<Accesibilidade[]>(
		[]
	);
	const [cargandoComentarios, setCargandoComentarios] = useState(true);
	const [newComment, setNewComment] = useState<string>('');

	const cleanInput = (input: string) => {
		return input.replace(/(<([^>]+)>)/gi, '');
	};

	async function handleClick() {
		try {
			const response = await axios.post(
				'/api/comentarios/',
				{
					usuario: userId,
					videoxogo: xogoId,
					comentario: cleanInput(newComment),
					likes: 0,
					dislikes: 0,
				},
				{
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
				}
			);

			// Actualizar el estado de comentarios inmediatamente con el nuevo comentario
			setComentarios((prevComentarios) => [
				...prevComentarios,
				response.data,
			]);

			// Limpiar el input
			setNewComment('');
		} catch (error) {
			console.error('Error al enviar el comentario:', error);
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Cargar el juego
				const xogoResponse = await axios.get(
					`/api/videoxogos/${xogoId}/`
				);
				setXogo(xogoResponse.data);

				// Cargar todas las plataformas
				const plataformasResponse = await axios.get(
					'/api/plataformas/'
				);
				setPlataformas(plataformasResponse.data);

				// Cargar todas las accesibilidades
				const accesibilidadesResponse = await axios.get(
					'/api/accesibilidades/'
				);
				setAccesibilidades(accesibilidadesResponse.data);

				// Cargar los comentarios del juego
				setCargandoComentarios(true);
				const comentariosResponse = await axios.get(
					'/api/comentarios/'
				);
				const comentariosFiltrados = comentariosResponse.data.filter(
					(comentario: Comentario) => comentario.videoxogo === xogoId
				);
				setComentarios(comentariosFiltrados);
				setCargandoComentarios(false);
			} catch (error) {
				console.error('Error:', error);
				setCargandoComentarios(false);
			}
		};

		fetchData();
	}, [xogoId, userId]);

	if (!xogo) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<span
					className="loading loading-spinner loading-lg"
					role="status"
					aria-label="Cargando detalles do xogo"
				></span>
			</div>
		);
	}

	// Filtrar las plataformas que corresponden al juego
	const plataformasXogo = plataformas.filter((plataforma) =>
		xogo.plataforma.includes(plataforma.id)
	);

	// Filtrar las accesibilidades que corresponden al juego
	const accesibilidadesXogo = accesibilidades.filter((acc) =>
		xogo.accesibilidades.includes(acc.id)
	);

	return (
		<>
			<div className="w-full flex flex-col items-center">
				<div className="w-full max-w-4xl px-4 py-8">
					<button
						onClick={onVolver}
						className="btn btn-ghost mb-6 flex items-center gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Voltar ao catálogo
					</button>

					<div className="bg-base-200 rounded-lg p-6 shadow-lg">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-4xl font-bold text-center">
								{xogo.titulo}
							</h1>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="flex justify-center mb-6">
									<img
										src={xogo.caratula}
										alt={`Carátula de ${xogo.titulo}`}
										className="w-64 h-64 object-cover rounded-lg shadow-lg"
									/>
								</div>
								<div>
									<h2 className="text-xl font-semibold mb-2">
										Descrición
									</h2>
									<p className="text-base-content/80">
										{xogo.descricion}
									</p>
								</div>

								<div>
									<h2 className="text-xl font-semibold mb-2">
										Prezo
									</h2>
									<p className="text-2xl font-bold text-primary">
										{xogo.prezo}€
									</p>
								</div>

								<div>
									<h2 className="text-xl font-semibold mb-2">
										Idade recomendada
									</h2>
									<p className="text-lg">
										+{xogo.idade_recomendada} anos
									</p>
								</div>

								<div>
									<h2 className="text-xl font-semibold mb-2">
										Desarrolladora
									</h2>
									<p className="text-lg">
										{xogo.desarrolladora}
									</p>
								</div>

								<div>
									<h2 className="text-xl font-semibold mb-2">
										Plataformas
									</h2>
									<div className="flex flex-wrap gap-2">
										{plataformasXogo.map((plataforma) => (
											<span
												key={plataforma.id}
												className="badge badge-primary"
											>
												{plataforma.plataforma}
											</span>
										))}
									</div>
								</div>
							</div>

							<div>
								<h2 className="text-xl font-semibold mb-2">
									Accesibilidades
								</h2>
								<div className="space-y-2">
									{accesibilidadesXogo.map((acc) => (
										<div
											key={acc.id}
											className="bg-base-300 p-3 rounded-lg"
										>
											<h3 className="font-medium">
												{acc.nome_accesibilidade}
											</h3>
											<p className="text-sm text-base-content/70">
												{acc.descricion}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Sección de comentarios */}

						<div className="mt-8">
							<h2 className="text-2xl font-semibold mb-4">
								Comentarios
							</h2>
							{userId != 0 && (
								<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
									<legend className="fieldset-legend">
										Engade o teu comentario
									</legend>
									<div className="join">
										<input
											type="text"
											className="input join-item"
											placeholder="Que opinas do xogo?"
											value={newComment}
											onChange={(e) =>
												setNewComment(e.target.value)
											}
										/>
										<button
											className="btn join-item"
											onClick={handleClick}
										>
											Gardar
										</button>
									</div>
								</fieldset>
							)}
							{cargandoComentarios ? (
								<div className="flex justify-center">
									<div
										className="flex w-52 flex-col gap-4"
										role="status"
										aria-label="Cargando comentarios"
									>
										<div className="flex items-center gap-4">
											<div
												className="skeleton h-16 w-16 shrink-0 rounded-full"
												aria-hidden="true"
											></div>
											<div className="flex flex-col gap-4">
												<div
													className="skeleton h-4 w-20"
													aria-hidden="true"
												></div>
												<div
													className="skeleton h-4 w-28"
													aria-hidden="true"
												></div>
											</div>
										</div>
										<div
											className="skeleton h-32 w-full"
											aria-hidden="true"
										></div>
									</div>
								</div>
							) : comentarios.length === 0 && userId == 0 ? (
								'Inicia sesión e deixa o teu comentario! '
							) : (
								<div className="space-y-4">
									{comentarios.map((comentario, index) => (
										<>
											<Comentario
												key={comentario.id}
												id={comentario.id}
												comentario={
													comentario.comentario
												}
												usuario={comentario.usuario}
												videoxogo={comentario.videoxogo}
											/>
											{index < comentarios.length - 1 && (
												<div className="divider divider-primary opacity-50"></div>
											)}
										</>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default XogoDetalle;
