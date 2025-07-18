import { useState, useEffect } from 'react';
import axios from 'axios';
interface ComentarioProps {
	id: number;
	comentario: string;
	usuario: number;
	videoxogo: number;
}

interface Usuario {
	id: number;
	favoritos: number[];
	nome: string;
	email: string;
	imaxe_user: string | null;
	admin: boolean;
}

const Comentario = ({ comentario, usuario }: ComentarioProps) => {
	const [user, setUser] = useState<Usuario | null>(null);

	useEffect(() => {
		axios
			.get(`/api/usuarios/${usuario}`)
			.then((response) => setUser(response.data))
			.catch((err) => console.error('Error fetch user -> ', err));
	}, [usuario]);

	if (!user) {
		return (
			<div
				className="flex w-52 flex-col gap-4"
				role="status"
				aria-label="Cargando información do usuario"
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
				<div className="skeleton h-32 w-full" aria-hidden="true"></div>
			</div>
		);
	}

	return (
		<div className="bg-base-100 rounded-box shadow-md p-4">
			<div className="flex items-center gap-4">
				{user.imaxe_user && (
					<img
						className="size-10 rounded-box"
						src={user.imaxe_user}
						alt="Imaxe do usuario"
					/>
				)}
				<p className="text-xl font-bold">{user.nome}</p>
			</div>
			<div className="divider divider-primary opacity-25 my-2"></div>
			<p className="text-base-content/80">{comentario}</p>
		</div>
	);
};

export default Comentario;
