import GameCard from '../../catalogo/components/GameCard';

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

interface AccesibilidadeType {
	id: number;
	nome_accesibilidade: string;
}

interface FavoritosProps {
	xogos: Xogo[];
	favoritos: number[];
	onVerDetalles: (id: number) => void;
	onToggleFavorito: (id: number) => void;
	userName?: string;
	accesibilidades: AccesibilidadeType[];
	userId: number;
}

const Favoritos = ({
	xogos,
	favoritos,
	onVerDetalles,
	onToggleFavorito,
	userName,
	accesibilidades,
	userId,
}: FavoritosProps) => {
	const xogosFavoritos = xogos.filter((xogo) => favoritos.includes(xogo.id));

	return (
		<div className="w-full">
			<h2 className="text-2xl font-bold mb-6">
				{userName ? `Favoritos de ${userName}` : 'Xogos Favoritos'}
			</h2>
			{xogosFavoritos.length === 0 ? (
				<p className="text-gray-500">Aínda non tes xogos favoritos</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{xogosFavoritos.map((xogo) => (
						<GameCard
							key={xogo.id}
							xogo={xogo}
							onVerDetalles={onVerDetalles}
							onToggleFavorito={onToggleFavorito}
							isFavorito={true}
							accesibilidades={accesibilidades}
							userId={userId}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Favoritos;
