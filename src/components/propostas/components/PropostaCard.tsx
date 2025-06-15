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

interface PropostaCardProps {
	proposta: Proposta;
	onAceptar?: (proposta: Proposta) => void;
	onRechazar?: (propostaId: number) => void;
	showActions?: boolean;
	userName?: string;
	accesibilidades: Array<{
		id: number;
		nome_accesibilidade: string;
	}>;
}

const PropostaCard = ({
	proposta,
	onAceptar,
	onRechazar,
	showActions = false,
	userName,
	accesibilidades,
}: PropostaCardProps) => {
	return (
		<div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 motion-safe:hover:scale-105 h-full flex flex-col">
			<figure className="px-4 pt-4">
				<img
					src={proposta.caratula}
					alt={proposta.titulo}
					className="rounded-xl h-32 sm:h-40 md:h-48 w-full object-cover"
				/>
			</figure>
			<div className="card-body flex flex-col flex-grow p-2">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1">
					<h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold break-words flex-grow min-w-0 pr-2">
						{proposta.titulo}
					</h2>
					<div className="flex items-center gap-2">
						<div
							className={`badge ${
								proposta.estado === 'PENDENTE'
									? 'badge-warning'
									: proposta.estado === 'APROBADA'
									? 'badge-success'
									: 'badge-error'
							} text-xs`}
						>
							{proposta.estado}
						</div>
						<div className="badge badge-secondary text-xs flex-shrink-0">
							+{proposta.idade_recomendada}
						</div>
					</div>
				</div>
				<p className="text-xs text-base-content/70 mb-1">
					Desarrollado por: {proposta.desarrolladora}
				</p>
				{userName && (
					<p className="text-xs text-base-content/70 mb-1">
						Enviado por: {userName}
					</p>
				)}
				<p className="line-clamp-2 text-xs text-base-content/80 mb-2">
					{proposta.descricion}
				</p>
				<div className="flex flex-wrap gap-1 mt-1 mb-2">
					{proposta.accesibilidades.map((accId) => {
						const acc = accesibilidades.find((a) => a.id === accId);
						return acc ? (
							<div
								key={acc.id}
								className="badge badge-primary badge-xs sm:badge-sm"
							>
								{acc.nome_accesibilidade}
							</div>
						) : null;
					})}
				</div>
				<div className="card-actions flex-wrap flex-col sm:flex-row justify-between items-center mt-auto pt-2">
					<div className="text-base font-bold text-primary flex-shrink-0 mb-2 sm:mb-0">
						{proposta.prezo}€
					</div>
					<div className="flex gap-1 w-full sm:w-auto justify-end flex-wrap">
						{showActions && onAceptar && onRechazar ? (
							<>
								<button
									className="btn btn-success btn-sm text-xs transition-all duration-300 motion-safe:hover:scale-105"
									onClick={() => onAceptar(proposta)}
								>
									Aceptar
								</button>
								<button
									className="btn btn-error btn-sm text-xs transition-all duration-300 motion-safe:hover:scale-105"
									onClick={() => onRechazar(proposta.id)}
								>
									Rexeitar
								</button>
							</>
						) : (
							''
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PropostaCard;
