import Like from '../../detalles/components/Like';

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

interface Accesibilidade {
	id: number;
	nome_accesibilidade: string;
}

interface GameCardProps {
	xogo: Xogo;
	onVerDetalles: (id: number) => void;
	onToggleFavorito: (id: number) => void;
	isFavorito: boolean;
	accesibilidades: Accesibilidade[];
}

const GameCard = ({
	xogo,
	onVerDetalles,
	onToggleFavorito,
	isFavorito,
	accesibilidades,
}: GameCardProps) => {
	return (
		<div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 motion-safe:hover:scale-105 h-full flex flex-col">
			<figure className="px-4 pt-4">
				<img
					src={xogo.caratula}
					alt={xogo.titulo}
					className="rounded-xl h-32 sm:h-40 md:h-48 w-full object-cover"
				/>
			</figure>
			<div className="card-body flex flex-col flex-grow p-2">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1">
					<h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold break-words flex-grow min-w-0 pr-2">
						{xogo.titulo}
					</h2>
					<div className="badge badge-secondary text-xs flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
						+{xogo.idade_recomendada}
					</div>
				</div>
				<p className="text-xs text-base-content/70 mb-1">
					Desarrollado por: {xogo.desarrolladora}
				</p>
				<p className="line-clamp-2 text-xs text-base-content/80 mb-2">
					{xogo.descricion}
				</p>
				<div className="flex flex-wrap gap-1 mt-1 mb-2">
					{xogo.accesibilidades?.map((accId) => {
						const acc = accesibilidades.find((a) => a.id === accId);
						return (
							acc && (
								<div
									key={acc.id}
									className="badge badge-primary badge-xs sm:badge-sm"
								>
									{acc.nome_accesibilidade}
								</div>
							)
						);
					})}
				</div>
				<div className="card-actions flex-wrap flex-col sm:flex-row justify-between items-center mt-auto pt-2">
					<div className="text-base font-bold text-primary flex-shrink-0 mb-2 sm:mb-0">
						{xogo.prezo}€
					</div>
					<div className="flex gap-1 w-full sm:w-auto justify-end flex-wrap">
						<button
							className="btn btn-primary btn-sm text-xs w-full sm:w-auto transition-all duration-300 motion-safe:hover:scale-105"
							onClick={() => onVerDetalles(xogo.id)}
						>
							Ver detalles
						</button>
						<Like
							liked={isFavorito}
							onClick={() => onToggleFavorito(xogo.id)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameCard;
