import { useEffect, useState } from 'react';
import axios from 'axios';

interface XogoDetalleProps {
	xogoId: number;
	onVolver: () => void;
}

interface Plataforma {
	id: number;
	plataforma: string;
}

interface Xogo {
	id: number;
	titulo: string;
	accesibilidades: Array<{
		id: number;
		nome_accesibilidade: string;
		descricion: string;
	}>;
	plataforma: Array<number>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	desarrolladora: string;
}

const XogoDetalle = ({ xogoId, onVolver }: XogoDetalleProps) => {
	const [xogo, setXogo] = useState<Xogo | null>(null);
	const [plataformas, setPlataformas] = useState<Plataforma[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Cargar el juego
				const xogoResponse = await axios.get(
					`https://restapitodasxogan.onrender.com/api/videoxogos/${xogoId}/`
				);
				setXogo(xogoResponse.data);

				// Cargar todas las plataformas
				const plataformasResponse = await axios.get(
					'https://restapitodasxogan.onrender.com/api/plataformas/'
				);
				setPlataformas(plataformasResponse.data);
			} catch (error) {
				console.error('Error:', error);
			}
		};

		fetchData();
	}, [xogoId]);

	if (!xogo) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	// Filtrar las plataformas que corresponden al juego
	const plataformasXogo = plataformas.filter((plataforma) =>
		xogo.plataforma.includes(plataforma.id)
	);

	return (
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
					<h1 className="text-4xl font-bold mb-6 text-center">
						{xogo.titulo}
					</h1>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
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
								<p className="text-lg">{xogo.desarrolladora}</p>
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
								{xogo.accesibilidades.map((acc) => (
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
				</div>
			</div>
		</div>
	);
};

export default XogoDetalle;
