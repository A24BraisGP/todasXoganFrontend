import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface Props {
	onClick: () => void;
	liked: boolean;
}

function Like({ onClick, liked }: Props) {
	return (
		<button
			onClick={onClick}
			className="btn btn-ghost btn-circle"
			aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
		>
			{liked ? (
				<FaHeart className="text-amber-500 text-xl" />
			) : (
				<FaRegHeart className="text-gray-500 text-xl hover:text-amber-500" />
			)}
		</button>
	);
}

export default Like;
