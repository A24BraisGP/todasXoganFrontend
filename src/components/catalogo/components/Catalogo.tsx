import GameCard from './GameCard';
import { useState } from 'react';
interface Xogo {
	id: number;
	titulo: string;
	accesibilidades: Array<number>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	plataforma: Array<number>;
	caratula: string;
	desarrolladora: string;
}

interface Xenero {
	id: number;
	xenero: string;
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

interface CatalogoProps {
	xogos: Xogo[];
	xeneros: Xenero[];
	plataformas: Plataforma[];
	accesibilidades: Accesibilidade[];
	onVerDetalles: (id: number) => void;
	onToggleFavorito: (id: number) => void;
	favoritos: number[];
	userId: number;
	comentarios: Array<{
		id: number;
		comentario: string;
		usuario: number;
		videoxogo: number;
	}>;
}

const Catalogo = ({
	xogos,
	xeneros,
	plataformas,
	accesibilidades,
	onVerDetalles,
	onToggleFavorito,
	favoritos,
	userId,
	comentarios,
}: CatalogoProps) => {
	const [filtroAccesibilidade, setFiltroAccesibilidad] = useState<string>('');
	const [filtroXenero, setFiltroGenero] = useState<string>('');
	const [filtroPlataforma, setFiltroPlataforma] = useState<string>('');
	const [filtroPrezoMin, setFiltroPrezoMin] = useState<string>('');
	const [filtroPrezoMax, setFiltroPrezoMax] = useState<string>('');
	const [filtroNome, setFiltroNombre] = useState<string>('');
	const [ordearPor, setOrdenarPor] = useState<string>('');

	const xogosFiltrados = xogos.filter((xogo) => {
		// Filtro por nome
		if (
			filtroNome &&
			!xogo.titulo.toLowerCase().includes(filtroNome.toLowerCase())
		) {
			return false;
		}

		// Filtro por accesibilidade
		if (
			filtroAccesibilidade &&
			!xogo.accesibilidades.includes(Number(filtroAccesibilidade))
		) {
			return false;
		}

		// Filtro por xénero
		if (filtroXenero && !xogo.xenero.includes(Number(filtroXenero))) {
			return false;
		}

		// Filtro por plataforma
		if (
			filtroPlataforma &&
			!xogo.plataforma.includes(Number(filtroPlataforma))
		) {
			return false;
		}

		// Filtro por prezo mínimo
		if (filtroPrezoMin && xogo.prezo < Number(filtroPrezoMin)) {
			return false;
		}

		// Filtro por prezo máximo
		if (filtroPrezoMax && xogo.prezo > Number(filtroPrezoMax)) {
			return false;
		}

		return true;
	});

	// Ordena os xogos nun novo array que é o que renderiza
	const xogosOrdenados = [...xogosFiltrados].sort((a, b) => {
		switch (ordearPor) {
			case 'precio-asc':
				return a.prezo - b.prezo;
			case 'precio-desc':
				return b.prezo - a.prezo;
			case 'edad-asc':
				return a.idade_recomendada - b.idade_recomendada;
			case 'edad-desc':
				return b.idade_recomendada - a.idade_recomendada;
			case 'favoritos':
				const aEsFavorito = favoritos.includes(a.id);
				const bEsFavorito = favoritos.includes(b.id);
				if (aEsFavorito && !bEsFavorito) return -1;
				if (!aEsFavorito && bEsFavorito) return 1;
				return 0;
			case 'comentarios':
				const comentariosA = comentarios.filter(
					(c) => c.videoxogo === a.id
				).length;
				const comentariosB = comentarios.filter(
					(c) => c.videoxogo === b.id
				).length;
				return comentariosB - comentariosA;
			default:
				return 0;
		}
	});

	return (
		<div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:gap-8">
			{/* Columna de filtros */}
			<div className="w-full lg:sticky lg:top-8 lg:self-start">
				<div className="bg-base-200 p-4 rounded-lg">
					<h2 className="text-xl font-bold mb-4">Filtros</h2>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Procura por Nome</span>
						</label>
						<input
							type="text"
							className="input input-bordered w-full"
							value={filtroNome}
							onChange={(e) => setFiltroNombre(e.target.value)}
							placeholder="Nome do xogo..."
						/>
					</div>

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Accesibilidade</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={filtroAccesibilidade}
							onChange={(e) =>
								setFiltroAccesibilidad(e.target.value)
							}
						>
							<option value="">Todas</option>
							{accesibilidades.map((acc) => (
								<option key={acc.id} value={acc.id}>
									{acc.nome_accesibilidade}
								</option>
							))}
						</select>
					</div>

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Xénero</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={filtroXenero}
							onChange={(e) => setFiltroGenero(e.target.value)}
						>
							<option value="">Todos</option>
							{xeneros.map((xenero) => (
								<option key={xenero.id} value={xenero.id}>
									{xenero.xenero}
								</option>
							))}
						</select>
					</div>

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Plataforma</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={filtroPlataforma}
							onChange={(e) =>
								setFiltroPlataforma(e.target.value)
							}
						>
							<option value="">Todas</option>
							{plataformas.map((plataforma) => (
								<option
									key={plataforma.id}
									value={plataforma.id}
								>
									{plataforma.plataforma}
								</option>
							))}
						</select>
					</div>

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">
								Rango de prezo (€)
							</span>
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								className="input input-bordered w-full"
								value={filtroPrezoMin}
								onChange={(e) =>
									setFiltroPrezoMin(e.target.value)
								}
								min="0"
								step="1"
								placeholder="Mín"
							/>
							<input
								type="number"
								className="input input-bordered w-full"
								value={filtroPrezoMax}
								onChange={(e) =>
									setFiltroPrezoMax(e.target.value)
								}
								min="0"
								step="1"
								placeholder="Máx"
							/>
						</div>
					</div>

					<div className="form-control mt-4">
						<label className="label">
							<span className="label-text">Ordear por ...</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={ordearPor}
							onChange={(e) => setOrdenarPor(e.target.value)}
						>
							<option value="">Ordear por...</option>
							<option value="precio-asc">
								Prezo: Menor a Maior
							</option>
							<option value="precio-desc">
								Prezo: Maior a Menor
							</option>
							<option value="favoritos">Favoritos</option>
							<option value="comentarios">Máis comentados</option>
						</select>
					</div>
				</div>
			</div>
			{/* Columna de cartas de juegos */}
			<div className="w-full">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
					{xogosOrdenados.map((xogo) => (
						<GameCard
							key={xogo.id}
							xogo={xogo}
							onVerDetalles={onVerDetalles}
							onToggleFavorito={onToggleFavorito}
							isFavorito={favoritos.includes(xogo.id)}
							accesibilidades={accesibilidades}
							userId={userId}
						/>
					))}
				</div>
				{xogosOrdenados.length === 0 && (
					<div className="text-center text-lg mt-8">
						Non se atoparon xogos...
					</div>
				)}
			</div>
		</div>
	);
};

export default Catalogo;
