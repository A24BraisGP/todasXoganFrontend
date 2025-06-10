import React from 'react';
import Like from '../../detalles/components/Like';

interface Xogo {
	id: number;
	titulo: string;
	accesibilidades: Array<{
		id: number;
		nome_accesibilidade: string;
		descricion: string;
	}>;
	descricion: string;
	prezo: number;
	idade_recomendada: number;
	xenero: Array<number>;
	plataforma: Array<number>;
	caratula: string;
	desarrolladora: string;
}

interface GameCardProps {
	xogo: Xogo;
	onVerDetalles: (id: number) => void;
	onToggleFavorito: (id: number) => void;
	isFavorito: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
	xogo,
	onVerDetalles,
	onToggleFavorito,
	isFavorito,
}) => {
	return (
		<div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
			<figure className="px-4 pt-4">
				<img
					src={xogo.caratula}
					alt={xogo.titulo}
					className="rounded-xl h-48 w-full object-cover"
				/>
			</figure>
			<div className="card-body">
				<h2 className="card-title">
					{xogo.titulo}
					<div className="badge badge-secondary">
						+{xogo.idade_recomendada}
					</div>
				</h2>
				<p className="text-sm text-base-content/70 mb-2">
					Desarrollado por: {xogo.desarrolladora}
				</p>
				<p className="line-clamp-2 text-base-content/80">
					{xogo.descricion}
				</p>
				<div className="flex flex-wrap gap-2 mt-2">
					{xogo.accesibilidades.map((acc) => (
						<div key={acc.id} className="badge badge-primary">
							{acc.nome_accesibilidade}
						</div>
					))}
				</div>
				<div className="card-actions justify-between items-center mt-4">
					<div className="text-lg font-bold text-primary">
						{xogo.prezo}€
					</div>
					<div className="flex gap-2">
						<button
							className="btn btn-primary"
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
